import { getStripe } from "@/lib/payments";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { intentId, email, resumeId } = await request.json();

  if (!intentId || !email) {
    return Response.json(
      { error: "intentId and email required" },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  // Only the user the intent was created for may change its metadata
  const stripe = getStripe();
  const intent = await stripe.paymentIntents.retrieve(intentId);
  if (intent.metadata.userId !== user.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  // The webhook snapshots this resume, so it must belong to the user
  let ownedResumeId: string | null = null;
  if (resumeId) {
    const { data: resume } = await supabase
      .from("resumes")
      .select("id")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .single();
    ownedResumeId = resume?.id ?? null;
  }

  await stripe.paymentIntents.update(intentId, {
    receipt_email: email,
    metadata: { email, ...(ownedResumeId ? { resumeId: ownedResumeId } : {}) },
  });

  return Response.json({ ok: true });
}
