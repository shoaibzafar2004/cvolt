import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

interface Props {
  params: Promise<{ paymentId: string }>;
}

export async function GET(_req: Request, { params }: Props) {
  const { paymentId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?returnTo=/api/download-pdf/${paymentId}`);

  // Verify payment belongs to user and is completed
  const { data: payment } = await supabase
    .from("payments")
    .select("id, expires_at, user_id, snapshot_id, purchased_at")
    .eq("id", paymentId)
    .eq("user_id", user.id)
    .eq("status", "completed")
    .is("deleted_at", null)
    .single();

  if (!payment) return new Response("Not found", { status: 404 });
  if (new Date(payment.expires_at) < new Date()) {
    return new Response("Download link expired", { status: 410 });
  }

  // Fetch snapshot to get the resume owner's name for the filename
  const { data: snapshot } = payment.snapshot_id
    ? await getServiceClient()
        .from("resume_snapshots")
        .select("snapshot_data")
        .eq("id", payment.snapshot_id)
        .single()
    : { data: null };

  const resumeName = (
    snapshot?.snapshot_data as { personalInfo?: { name?: string } } | null
  )?.personalInfo?.name;

  const purchaseDate = new Date(payment.purchased_at)
    .toISOString()
    .slice(0, 10); // YYYY-MM-DD
  const safeName = (resumeName ?? "resume")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
  const filename = `${safeName}-${purchaseDate}.pdf`;

  const pdfUserId = payment.user_id ?? user.id;
  const pdfPath = `resumes/${pdfUserId}/${paymentId}.pdf`;
  const { data: signed } = await getServiceClient()
    .storage.from("pdfs")
    .createSignedUrl(pdfPath, 60);

  if (!signed?.signedUrl) return new Response("PDF not found", { status: 404 });

  // Fetch from Supabase storage and stream back with Content-Disposition: attachment
  const pdfRes = await fetch(signed.signedUrl);
  if (!pdfRes.ok) return new Response("PDF unavailable", { status: 502 });

  return new Response(pdfRes.body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
