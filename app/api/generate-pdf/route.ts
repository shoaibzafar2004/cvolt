import { createClient } from "@supabase/supabase-js";
import { generatePdfFromHtml } from "@/lib/pdf";
import { getTemplate } from "@/lib/templates";
import { createElement } from "react";
import type { ResumeData } from "@/types";

export const maxDuration = 60;

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function POST(request: Request) {
  const { paymentId } = await request.json();

  if (!paymentId) {
    return Response.json({ error: "paymentId required" }, { status: 400 });
  }

  const supabase = getServiceClient();

  // Verify payment is completed
  const { data: payment } = await supabase
    .from("payments")
    .select("id, status, template_id, snapshot_id, user_id")
    .eq("id", paymentId)
    .single();

  if (!payment || payment.status !== "completed") {
    return Response.json(
      { error: "Payment not found or not completed" },
      { status: 403 },
    );
  }

  // Load snapshot data
  const { data: snapshot } = await supabase
    .from("resume_snapshots")
    .select("snapshot_data")
    .eq("payment_id", paymentId)
    .single();

  if (!snapshot) {
    return Response.json({ error: "Snapshot not found" }, { status: 404 });
  }

  const resumeData = snapshot.snapshot_data as ResumeData;

  // Generate PDF
  const TemplateComponent = getTemplate(payment.template_id);
  const { renderToStaticMarkup } = await import("react-dom/server");
  const html = renderToStaticMarkup(
    createElement(TemplateComponent, { data: resumeData }),
  );
  const pdfBuffer = await generatePdfFromHtml(html);

  // Upload to storage
  const pdfPath = `resumes/${payment.user_id ?? "anon"}/${paymentId}.pdf`;
  const { error: uploadError } = await supabase.storage
    .from("pdfs")
    .upload(pdfPath, pdfBuffer, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (uploadError) {
    return Response.json({ error: "Upload failed" }, { status: 500 });
  }

  // Return a signed URL valid for 5 minutes
  const { data: signed } = await supabase.storage
    .from("pdfs")
    .createSignedUrl(pdfPath, 300);

  return Response.json({ url: signed?.signedUrl });
}
