import { verifyStripeWebhook } from "@/lib/payments";
import { createClient } from "@supabase/supabase-js";
import { generatePdfFromHtml } from "@/lib/pdf";
import { getTemplate } from "@/lib/templates";
import type {
  ResumeData,
  WorkContent,
  EducationContent,
  SkillsContent,
} from "@/types";
import { createElement } from "react";

// Use service role client — webhook runs outside user session
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function POST(request: Request) {
  const payload = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) return new Response("Missing signature", { status: 400 });

  let event;
  try {
    event = verifyStripeWebhook(payload, sig);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type !== "payment_intent.succeeded") {
    return new Response("Ignored", { status: 200 });
  }

  const intent = event.data.object;
  const {
    templateId,
    email: metaEmail,
    userId: metaUserId,
    resumeId: metaResumeId,
  } = intent.metadata;
  const email = metaEmail ?? intent.receipt_email ?? "";

  const supabase = getServiceClient();

  // Stripe retries failed deliveries — reuse the row from an earlier attempt
  const { data: existingPayment } = await supabase
    .from("payments")
    .select("id, status")
    .eq("stripe_payment_id", intent.id)
    .maybeSingle();

  if (existingPayment?.status === "completed") {
    return new Response("Already processed", { status: 200 });
  }

  let paymentId: string | null = existingPayment?.id ?? null;

  try {
    // 1. Resolve userId across all three cases:
    //    Case A — logged in at checkout:   metadata.userId is set, use it directly.
    //    Case B — existing user, not logged in: createUser fails → look up public.users by email.
    //    Case C — brand new user:          createUser succeeds → use the new user's id.
    let userId: string | null = metaUserId ?? null;

    if (!userId && email) {
      const { data: created, error: createError } =
        await supabase.auth.admin.createUser({
          email,
          email_confirm: true,
        });

      if (created?.user) {
        userId = created.user.id;
      } else if (createError) {
        const { data: existing } = await supabase
          .from("users")
          .select("id")
          .eq("email", email)
          .single();
        userId = existing?.id ?? null;
      }
    }

    // 2. Find the resume being bought (set by /api/update-payment-intent,
    //    which checks ownership); fall back to the user's latest resume
    let { data: resume } = !userId
      ? { data: null }
      : metaResumeId
        ? await supabase
            .from("resumes")
            .select("id, personal_info")
            .eq("id", metaResumeId)
            .eq("user_id", userId)
            .single()
        : await supabase
            .from("resumes")
            .select("id, personal_info")
            .eq("user_id", userId)
            .order("updated_at", { ascending: false })
            .limit(1)
            .single();

    // 3. Fetch resume sections
    const { data: sections } = resume
      ? await supabase
          .from("resume_sections")
          .select("*")
          .eq("resume_id", resume.id)
          .order("display_order")
      : { data: [] };

    const resumeData: ResumeData = {
      personalInfo: (resume?.personal_info as ResumeData["personalInfo"]) ?? {
        name: "",
        jobTitle: "",
        email,
        phone: "",
        location: "",
      },
      sections: (sections ?? []).map((s) => ({
        id: s.id,
        type: s.section_type,
        content: s.content as WorkContent | EducationContent | SkillsContent,
        displayOrder: s.display_order,
      })),
    };

    // 3b. resume_snapshots.resume_id is NOT NULL — ensure a resume row exists
    if (!resume && userId) {
      const { data: newResume, error: resumeInsertError } = await supabase
        .from("resumes")
        .insert({
          user_id: userId,
          title: resumeData.personalInfo.name
            ? `${resumeData.personalInfo.name}'s Resume`
            : "My Resume",
          personal_info: resumeData.personalInfo,
        })
        .select("id, personal_info")
        .single();
      if (resumeInsertError)
        console.error("Resume insert error:", resumeInsertError);
      resume = newResume;
    }

    // 4. Step 1 of circular FK fix: insert payment with snapshot_id = null
    //    Status stays 'pending' until PDF is uploaded — processing page polls for 'completed'
    if (paymentId) {
      // Retry: back to pending, and drop the previous attempt's snapshot
      await supabase
        .from("payments")
        .update({ status: "pending", snapshot_id: null })
        .eq("id", paymentId);
      await supabase
        .from("resume_snapshots")
        .delete()
        .eq("payment_id", paymentId);
    } else {
      const { data: inserted, error: paymentError } = await supabase
        .from("payments")
        .insert({
          user_id: userId,
          snapshot_id: null,
          template_id: templateId,
          stripe_payment_id: intent.id,
          amount: intent.amount / 100,
          currency: intent.currency,
          status: "pending",
        })
        .select("id")
        .single();

      if (paymentError || !inserted)
        throw new Error(
          `Failed to create payment record: ${paymentError?.message}`,
        );
      paymentId = inserted.id;
    }
    const payment = { id: paymentId };

    // 5. Step 2: insert snapshot
    if (!resume?.id)
      throw new Error("Cannot create snapshot: resume record is missing");
    // Measure only section content — must match what the download gate computes
    const charCount = JSON.stringify(
      resumeData.sections.map((s) => s.content),
    ).length;
    const { data: snapshot, error: snapshotError } = await supabase
      .from("resume_snapshots")
      .insert({
        resume_id: resume?.id,
        payment_id: payment.id,
        snapshot_data: resumeData,
        char_count: charCount,
      })
      .select("id")
      .single();

    if (snapshotError || !snapshot)
      throw new Error(`Failed to create snapshot: ${snapshotError?.message}`);

    // 6. Step 3: link snapshot back to payment
    await supabase
      .from("payments")
      .update({ snapshot_id: snapshot.id })
      .eq("id", payment.id);

    // 7. Generate PDF — look up slug from DB since templateId is a UUID
    const { data: templateRow } = await supabase
      .from("templates")
      .select("slug")
      .eq("id", templateId)
      .single();

    if (!templateRow) throw new Error(`Template not found: ${templateId}`);
    const TemplateComponent = getTemplate(templateRow.slug);
    const { renderToStaticMarkup } = await import("react-dom/server");
    const html = renderToStaticMarkup(
      createElement(TemplateComponent, { data: resumeData }),
    );
    const pdfBuffer = await generatePdfFromHtml(html);

    // 8. Upload PDF to Supabase Storage
    const pdfPath = `resumes/${userId ?? "anon"}/${payment.id}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from("pdfs")
      .upload(pdfPath, pdfBuffer, {
        contentType: "application/pdf",
        upsert: true,
      });
    if (uploadError)
      throw new Error(`PDF upload failed: ${uploadError.message}`);

    // 9. Mark payment as completed — only now is the PDF ready for download
    const { error: completeError } = await supabase
      .from("payments")
      .update({ status: "completed" })
      .eq("id", payment.id);
    if (completeError)
      throw new Error(`Failed to complete payment: ${completeError.message}`);

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("Webhook error:", err);
    // Lets the processing page stop waiting; Stripe's retry resets it to pending
    if (paymentId) {
      await supabase
        .from("payments")
        .update({ status: "failed" })
        .eq("id", paymentId);
    }
    return new Response("Internal error", { status: 500 });
  }
}

// App Router route handlers receive the raw Request body — no bodyParser config needed.
