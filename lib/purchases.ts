import "server-only";
import { createHash } from "crypto";
import { createElement } from "react";
import {
  createClient as createSupabaseClient,
  type SupabaseClient,
} from "@supabase/supabase-js";
import { generatePdfFromHtml } from "@/lib/pdf";
import { getTemplate } from "@/lib/templates";
import { changeRatio, FREE_EDIT_LIMIT } from "@/lib/resume-diff";
import { shapeDbRowToResumeData, type DbResume } from "@/lib/utils";
import type { ResumeData } from "@/types";

// Server-side helpers for purchases: each completed payment owns its own resume
// (resumes.purchased = true), a frozen snapshot of it, and a stored PDF.
// All use the service-role client — callers must check ownership first.

export function getServiceClient(): SupabaseClient {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export function pdfPath(userId: string, paymentId: string): string {
  return `resumes/${userId}/${paymentId}.pdf`;
}

export interface LoadedResume {
  id: string;
  userId: string;
  purchased: boolean;
  data: ResumeData;
}

export async function loadResume(
  service: SupabaseClient,
  resumeId: string,
): Promise<LoadedResume | null> {
  const { data: row } = await service
    .from("resumes")
    .select(
      "id, user_id, purchased, personal_info, resume_sections(id, section_type, content, display_order)",
    )
    .eq("id", resumeId)
    .maybeSingle();
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    purchased: row.purchased,
    data: shapeDbRowToResumeData(row as DbResume),
  };
}

function sectionRows(resumeId: string, data: ResumeData) {
  return data.sections.map((s) => ({
    resume_id: resumeId,
    section_type: s.type,
    content: s.content,
    display_order: s.displayOrder,
  }));
}

/** New purchased resume holding a copy of `data`; returns its id. */
export async function createPurchasedResume(
  service: SupabaseClient,
  userId: string,
  data: ResumeData,
): Promise<string> {
  const { data: row, error } = await service
    .from("resumes")
    .insert({
      user_id: userId,
      title: data.personalInfo.name
        ? `${data.personalInfo.name}'s Resume`
        : "My Resume",
      personal_info: data.personalInfo,
      purchased: true,
    })
    .select("id")
    .single();
  if (error || !row)
    throw new Error(`Failed to copy resume: ${error?.message}`);

  if (data.sections.length) {
    const { error: secError } = await service
      .from("resume_sections")
      .insert(sectionRows(row.id, data));
    if (secError)
      throw new Error(`Failed to copy resume sections: ${secError.message}`);
  }
  return row.id;
}

/** Overwrite a resume's content (used to revert a purchase to what was bought). */
export async function replaceResumeContent(
  service: SupabaseClient,
  resumeId: string,
  data: ResumeData,
): Promise<void> {
  await service
    .from("resumes")
    .update({ personal_info: data.personalInfo })
    .eq("id", resumeId);
  await service.from("resume_sections").delete().eq("resume_id", resumeId);
  if (data.sections.length)
    await service.from("resume_sections").insert(sectionRows(resumeId, data));
}

/**
 * Identifies the content a PDF was rendered from. Section ids are left out:
 * the build steps re-insert sections on save, which changes ids but not content.
 */
export function pdfHash(slug: string, data: ResumeData): string {
  const normalized = {
    slug,
    personalInfo: data.personalInfo,
    // displayOrder is per section type, so sort by type too for a stable order
    sections: [...data.sections]
      .sort(
        (a, b) =>
          a.type.localeCompare(b.type) || a.displayOrder - b.displayOrder,
      )
      .map((s) => ({ type: s.type, content: s.content })),
  };
  return createHash("sha256").update(JSON.stringify(normalized)).digest("hex");
}

/** Render `data` with the template and upload it as the payment's PDF. */
export async function renderAndStorePdf(
  service: SupabaseClient,
  opts: { userId: string; paymentId: string; slug: string; data: ResumeData },
): Promise<string> {
  const Template = getTemplate(opts.slug);
  // Imported lazily — keeps react-dom/server out of the route's module graph
  const { renderToStaticMarkup } = await import("react-dom/server");
  const html = renderToStaticMarkup(
    createElement(Template, { data: opts.data }),
  );
  const pdf = await generatePdfFromHtml(html);

  const { error } = await service.storage
    .from("pdfs")
    .upload(pdfPath(opts.userId, opts.paymentId), pdf, {
      contentType: "application/pdf",
      upsert: true,
    });
  if (error) throw new Error(`PDF upload failed: ${error.message}`);

  const hash = pdfHash(opts.slug, opts.data);
  await service
    .from("payments")
    .update({ pdf_hash: hash })
    .eq("id", opts.paymentId);
  return hash;
}

export interface Purchase {
  paymentId: string;
  userId: string;
  templateId: string;
  slug: string;
  expiresAt: string;
  purchasedAt: string;
  pdfHash: string | null;
  resumeId: string;
  /** Resume as it was bought (frozen snapshot) */
  purchased: ResumeData;
  /** Resume as it is now (may have been re-edited) */
  current: ResumeData;
}

/** A completed, non-deleted payment of `userId`, with its resume. */
export async function getPurchase(
  service: SupabaseClient,
  paymentId: string,
  userId: string,
): Promise<Purchase | null> {
  const { data: payment } = await service
    .from("payments")
    .select(
      "id, user_id, template_id, expires_at, purchased_at, pdf_hash, snapshot_id, templates ( slug )",
    )
    .eq("id", paymentId)
    .eq("user_id", userId)
    .eq("status", "completed")
    .is("deleted_at", null)
    .maybeSingle();
  if (!payment?.snapshot_id) return null;

  const { data: snapshot } = await service
    .from("resume_snapshots")
    .select("resume_id, snapshot_data")
    .eq("id", payment.snapshot_id)
    .maybeSingle();
  if (!snapshot) return null;

  const resume = await loadResume(service, snapshot.resume_id);
  if (!resume) return null;

  const template = Array.isArray(payment.templates)
    ? payment.templates[0]
    : payment.templates;
  return {
    paymentId: payment.id,
    userId: payment.user_id,
    templateId: payment.template_id,
    slug: (template as { slug: string } | null)?.slug ?? "",
    expiresAt: payment.expires_at,
    purchasedAt: payment.purchased_at,
    pdfHash: payment.pdf_hash,
    resumeId: snapshot.resume_id,
    purchased: snapshot.snapshot_data as ResumeData,
    current: resume.data,
  };
}

export interface ReeditStatus {
  expired: boolean;
  /** Share of the purchased text that changed (0–1+) */
  change: number;
  /** Within 30 days and under the free-edit limit */
  free: boolean;
}

export function reeditStatus(purchase: Purchase): ReeditStatus {
  const expired = new Date(purchase.expiresAt) < new Date();
  const change = changeRatio(purchase.purchased, purchase.current);
  return { expired, change, free: !expired && change <= FREE_EDIT_LIMIT };
}
