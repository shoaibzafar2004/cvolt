import { createHmac, randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type { ResumeData, WorkContent } from "@/types";
import { fullResume } from "../fixtures";

// Walks one purchase through its whole lifecycle against the real local
// Supabase: webhook → own resume + snapshot + PDF, retries, the download
// gate (free / re-render / too many changes / expired / not yours) and buying
// a re-edit as a new resume. Everything is created for a throwaway user and
// removed in afterAll.

// The signed-in user. The route handlers' cookie-based client needs a Next
// request context, so only its getUser() is replaced; all data access below
// goes to the real database.
const session = vi.hoisted(() => ({
  user: null as { id: string; email: string } | null,
}));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: session.user } }) },
  }),
}));

const { POST: webhook } = await import("@/app/api/webhook/stripe/route");
const { GET: downloadPdf } =
  await import("@/app/api/download-pdf/[paymentId]/route");
const { getServiceClient, loadResume } = await import("@/lib/purchases");

const db = getServiceClient();
const runId = randomUUID().slice(0, 8);
const intentIds: string[] = [];

let userId = "";
let otherUserId = "";
let templateId = "";
let draftId = "";

async function createUser(label: string): Promise<string> {
  const { data, error } = await db.auth.admin.createUser({
    email: `it-${label}-${runId}@example.com`,
    email_confirm: true,
  });
  if (error || !data.user) throw error;
  return data.user.id;
}

async function createDraft(owner: string, data: ResumeData): Promise<string> {
  const { data: row, error } = await db
    .from("resumes")
    .insert({ user_id: owner, personal_info: data.personalInfo })
    .select("id")
    .single();
  if (error || !row) throw error;
  await db.from("resume_sections").insert(
    data.sections.map((s) => ({
      resume_id: row.id,
      section_type: s.type,
      content: s.content,
      display_order: s.displayOrder,
    })),
  );
  return row.id;
}

/** Deliver a signed payment_intent.succeeded event to the webhook handler. */
async function deliver(intentId: string, resumeId: string, sign = true) {
  if (!intentIds.includes(intentId)) intentIds.push(intentId);
  const payload = JSON.stringify({
    id: `evt_${intentId}`,
    object: "event",
    type: "payment_intent.succeeded",
    data: {
      object: {
        id: intentId,
        object: "payment_intent",
        amount: 150,
        currency: "usd",
        receipt_email: null,
        metadata: { templateId, userId, resumeId },
      },
    },
  });
  // Stripe's scheme: t=<unix time>,v1=HMAC-SHA256(secret, "<t>.<payload>")
  const t = Math.floor(Date.now() / 1000);
  const v1 = createHmac("sha256", process.env.STRIPE_WEBHOOK_SECRET!)
    .update(`${t}.${payload}`)
    .digest("hex");
  const signature = sign ? `t=${t},v1=${v1}` : `t=${t},v1=bad`;
  return webhook(
    new Request("http://localhost/api/webhook/stripe", {
      method: "POST",
      body: payload,
      headers: { "stripe-signature": signature },
    }),
  );
}

async function download(paymentId: string, as = userId) {
  session.user = { id: as, email: "" };
  return downloadPdf(new Request("http://localhost/api/download-pdf"), {
    params: Promise.resolve({ paymentId }),
  });
}

async function paymentFor(intentId: string) {
  const { data } = await db
    .from("payments")
    .select("id, status, pdf_hash, snapshot_id")
    .eq("stripe_payment_id", intentId);
  return data ?? [];
}

async function purchaseResumeId(paymentId: string): Promise<string> {
  const { data } = await db
    .from("resume_snapshots")
    .select("resume_id")
    .eq("payment_id", paymentId)
    .single();
  return data!.resume_id;
}

async function setFirstBullet(resumeId: string, bullet: string) {
  const { data: section } = await db
    .from("resume_sections")
    .select("id, content")
    .eq("resume_id", resumeId)
    .eq("section_type", "work")
    .order("display_order")
    .limit(1)
    .single();
  const content = section!.content as WorkContent;
  content.bullets[0] = bullet;
  await db.from("resume_sections").update({ content }).eq("id", section!.id);
}

const resumeText = async (id: string) =>
  JSON.stringify((await loadResume(db, id))!.data);

beforeAll(async () => {
  const { data: template } = await db
    .from("templates")
    .select("id")
    .eq("slug", "clean")
    .single();
  templateId = template!.id;
  userId = await createUser("buyer");
  otherUserId = await createUser("other");
  draftId = await createDraft(userId, fullResume());
});

afterAll(async () => {
  // Test fixtures only — real payment rows are never hard-deleted
  const { data: payments } = await db
    .from("payments")
    .select("id, user_id")
    .in("stripe_payment_id", intentIds);
  if (payments?.length) {
    await db.storage
      .from("pdfs")
      .remove(payments.map((p) => `resumes/${p.user_id}/${p.id}.pdf`));
    await db
      .from("payments")
      .delete()
      .in(
        "id",
        payments.map((p) => p.id),
      );
  }
  // Cascades to resumes, sections and snapshots
  for (const id of [userId, otherUserId].filter(Boolean))
    await db.auth.admin.deleteUser(id);
});

describe("purchase lifecycle", () => {
  const first = `pi_it_${runId}_1`;
  const second = `pi_it_${runId}_2`;
  let paymentId = "";
  let ownResumeId = "";
  let renderedHash = "";

  it("rejects an event with a bad signature", async () => {
    const res = await deliver(first, draftId, false);
    expect(res.status).toBe(400);
    expect(await paymentFor(first)).toHaveLength(0);
  });

  it("a payment gets its own purchased resume, snapshot and PDF", async () => {
    const res = await deliver(first, draftId);
    expect(res.status).toBe(200);

    const [payment] = await paymentFor(first);
    expect(payment.status).toBe("completed");
    expect(payment.snapshot_id).toBeTruthy();
    expect(payment.pdf_hash).toMatch(/^[0-9a-f]{64}$/);
    paymentId = payment.id;
    renderedHash = payment.pdf_hash;

    ownResumeId = await purchaseResumeId(paymentId);
    expect(ownResumeId).not.toBe(draftId);
    const own = await loadResume(db, ownResumeId);
    expect(own?.purchased).toBe(true);
    expect(JSON.stringify(own!.data)).toContain("Acme Corp");

    const { data: pdf } = await db.storage
      .from("pdfs")
      .download(`resumes/${userId}/${paymentId}.pdf`);
    const bytes = new Uint8Array(await pdf!.arrayBuffer());
    expect(new TextDecoder().decode(bytes.slice(0, 5))).toBe("%PDF-");
  });

  it("a replayed event is not processed twice", async () => {
    const res = await deliver(first, draftId);
    expect(await res.text()).toBe("Already processed");
    expect(await paymentFor(first)).toHaveLength(1);
  });

  it("downloads an unchanged purchase without re-rendering", async () => {
    const res = await download(paymentId);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("application/pdf");
    const [payment] = await paymentFor(first);
    expect(payment.pdf_hash).toBe(renderedHash);
  });

  it("is not downloadable by another user", async () => {
    const res = await download(paymentId, otherUserId);
    expect(res.status).toBe(404);
  });

  it("a small edit is free and re-renders the PDF", async () => {
    await setFirstBullet(
      ownResumeId,
      "Drove the <strong>payments</strong> rewrite, cutting checkout errors by 40%.",
    );
    const res = await download(paymentId);
    expect(res.status).toBe(200);
    const [payment] = await paymentFor(first);
    expect(payment.pdf_hash).not.toBe(renderedHash);
    // The draft is never touched by editing a purchase
    expect(await resumeText(draftId)).not.toContain("Drove the");
  });

  it("too many changes are not free (~24% of the text)", async () => {
    await setFirstBullet(ownResumeId, "Brand new rewritten text. ".repeat(6));
    const res = await download(paymentId);
    expect(res.status).toBe(402);
  });

  it("buying the re-edit creates a new resume and reverts the original", async () => {
    const res = await deliver(second, ownResumeId);
    expect(res.status).toBe(200);

    const [newPayment] = await paymentFor(second);
    expect(newPayment.status).toBe("completed");
    const newResumeId = await purchaseResumeId(newPayment.id);
    expect(newResumeId).not.toBe(ownResumeId);
    expect(await resumeText(newResumeId)).toContain("Brand new rewritten");

    // Original goes back to what was bought — and is free to download again
    const original = await resumeText(ownResumeId);
    expect(original).not.toContain("Brand new rewritten");
    expect(original).not.toContain("Drove the");
    expect((await download(paymentId)).status).toBe(200);
  });

  it("an expired purchase can't be downloaded", async () => {
    await db
      .from("payments")
      .update({ expires_at: new Date(Date.now() - 1000).toISOString() })
      .eq("id", paymentId);
    const res = await download(paymentId);
    expect(res.status).toBe(410);
  });
});
