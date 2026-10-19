"use server";

import { revalidatePath } from "next/cache";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export type DeleteResult = { ok: true } | { ok: false; error: string };

/**
 * Removes an expired purchase from the user's dashboard: deletes the stored PDF and
 * the frozen resume snapshot, and marks the payment deleted. The payment row itself
 * is kept (deleted_at) for Stripe/accounting reconciliation.
 */
export async function deleteExpiredPurchase(
  paymentId: string,
): Promise<DeleteResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in again." };

  const service = getServiceClient();
  const { data: payment } = await service
    .from("payments")
    .select("id, user_id, expires_at, snapshot_id")
    .eq("id", paymentId)
    .eq("user_id", user.id)
    .eq("status", "completed")
    .is("deleted_at", null)
    .single();
  if (!payment) return { ok: false, error: "Resume not found." };

  // Enforced here, not just in the UI: active purchases can't be deleted.
  if (new Date(payment.expires_at) > new Date()) {
    return { ok: false, error: "Only expired resumes can be deleted." };
  }

  const { error: storageError } = await service.storage
    .from("pdfs")
    .remove([`resumes/${user.id}/${payment.id}.pdf`]);
  if (storageError) {
    return { ok: false, error: "Couldn't delete the PDF. Please try again." };
  }

  // Delete the purchase's own resume; its snapshot cascades, and
  // payments.snapshot_id is ON DELETE SET NULL, so this also unlinks it.
  if (payment.snapshot_id) {
    const { data: snapshot } = await service
      .from("resume_snapshots")
      .select("resume_id")
      .eq("id", payment.snapshot_id)
      .maybeSingle();
    if (snapshot)
      await service
        .from("resumes")
        .delete()
        .eq("id", snapshot.resume_id)
        .eq("purchased", true);
    await service
      .from("resume_snapshots")
      .delete()
      .eq("id", payment.snapshot_id);
  }

  const { error: updateError } = await service
    .from("payments")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", payment.id);
  if (updateError) {
    return {
      ok: false,
      error: "Couldn't delete the resume. Please try again.",
    };
  }

  revalidatePath("/dashboard");
  return { ok: true };
}
