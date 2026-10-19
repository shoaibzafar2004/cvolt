import { verifyStripeWebhook } from "@/lib/payments";
import {
  createPurchasedResume,
  getServiceClient,
  loadResume,
  renderAndStorePdf,
  replaceResumeContent,
  type LoadedResume,
} from "@/lib/purchases";
import type { ResumeData } from "@/types";

// Every completed payment owns a new resume: the resume being bought (the /build
// draft, or a re-edited purchase) is copied into a purchased resume, frozen as a
// snapshot, and rendered to a PDF. A re-edited purchase is then reverted to what
// it was bought as, so it keeps matching its own purchase.

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
    if (!userId) throw new Error("Cannot resolve the buyer's account");

    // 2. The resume being bought: metadata.resumeId (ownership checked again
    //    here), else the user's latest draft
    let source: LoadedResume | null = null;
    if (metaResumeId) {
      source = await loadResume(supabase, metaResumeId);
      if (source && source.userId !== userId) source = null;
    }
    if (!source) {
      const { data: latest } = await supabase
        .from("resumes")
        .select("id")
        .eq("user_id", userId)
        .eq("purchased", false)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (latest) source = await loadResume(supabase, latest.id);
    }
    if (!source) throw new Error("No resume found to purchase");

    // 3. Payment row with snapshot_id = null (circular FK); stays 'pending'
    //    until the PDF is uploaded — the processing page polls for 'completed'
    if (paymentId) {
      // Retry: drop the previous attempt's purchased copy (cascades its snapshot)
      const { data: oldSnaps } = await supabase
        .from("resume_snapshots")
        .select("resume_id")
        .eq("payment_id", paymentId);
      await supabase
        .from("payments")
        .update({ status: "pending", snapshot_id: null })
        .eq("id", paymentId);
      await supabase
        .from("resume_snapshots")
        .delete()
        .eq("payment_id", paymentId);
      const oldIds = (oldSnaps ?? []).map((s) => s.resume_id);
      if (oldIds.length)
        await supabase
          .from("resumes")
          .delete()
          .in("id", oldIds)
          .eq("purchased", true);
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
    if (!paymentId) throw new Error("Payment record missing");
    const payment = { id: paymentId };

    // 4. This purchase's own resume + frozen snapshot of it
    const purchaseResumeId = await createPurchasedResume(
      supabase,
      userId,
      source.data,
    );
    // Measure only section content (kept for reference; the re-edit gate uses a word diff)
    const charCount = JSON.stringify(
      source.data.sections.map((s) => s.content),
    ).length;
    const { data: snapshot, error: snapshotError } = await supabase
      .from("resume_snapshots")
      .insert({
        resume_id: purchaseResumeId,
        payment_id: payment.id,
        snapshot_data: source.data,
        char_count: charCount,
      })
      .select("id")
      .single();

    if (snapshotError || !snapshot)
      throw new Error(`Failed to create snapshot: ${snapshotError?.message}`);

    await supabase
      .from("payments")
      .update({ snapshot_id: snapshot.id })
      .eq("id", payment.id);

    // 5. Generate + upload the PDF — look up slug since templateId is a UUID
    const { data: templateRow } = await supabase
      .from("templates")
      .select("slug")
      .eq("id", templateId)
      .single();

    if (!templateRow) throw new Error(`Template not found: ${templateId}`);
    await renderAndStorePdf(supabase, {
      userId,
      paymentId: payment.id,
      slug: templateRow.slug,
      data: source.data,
    });

    // 6. Mark payment as completed — only now is the PDF ready for download
    const { error: completeError } = await supabase
      .from("payments")
      .update({ status: "completed" })
      .eq("id", payment.id);
    if (completeError)
      throw new Error(`Failed to complete payment: ${completeError.message}`);

    // 7. Bought from an edited purchase: the edits now live in the new purchase,
    //    so the original goes back to what it was bought as
    if (source.purchased) {
      const { data: original } = await supabase
        .from("resume_snapshots")
        .select("snapshot_data")
        .eq("resume_id", source.id)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (original)
        await replaceResumeContent(
          supabase,
          source.id,
          original.snapshot_data as ResumeData,
        );
    }

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
