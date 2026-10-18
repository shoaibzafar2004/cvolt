import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { daysUntil } from "@/lib/utils";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import Link from "next/link";

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

interface Props {
  params: Promise<{ id: string }>;
}

const DIFF_THRESHOLD = 0.1;

export default async function DownloadPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?returnTo=/dashboard/download/${id}`);

  // Fetch payment (no join — avoids ambiguous FK between payments ↔ resume_snapshots)
  const { data: payment } = await supabase
    .from("payments")
    .select("id, expires_at, template_id, user_id, snapshot_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .eq("status", "completed")
    .is("deleted_at", null)
    .single();

  if (!payment) notFound();

  // Check 1: within 30 days?
  const expired = new Date(payment.expires_at) < new Date();
  if (expired) redirect(`/checkout?templateId=${payment.template_id}`);

  // Check 2: resume diff under 10%?
  const { data: snapshot } = payment.snapshot_id
    ? await supabase
        .from("resume_snapshots")
        .select("resume_id, char_count")
        .eq("id", payment.snapshot_id)
        .single()
    : { data: null };

  if (snapshot?.resume_id) {
    const { data: sections } = await supabase
      .from("resume_sections")
      .select("content")
      .eq("resume_id", snapshot.resume_id);

    const currentCharCount = JSON.stringify(
      (sections ?? []).map((s: { content: unknown }) => s.content),
    ).length;
    const diff =
      Math.abs(currentCharCount - snapshot.char_count) /
      (snapshot.char_count || 1);

    if (diff > DIFF_THRESHOLD)
      redirect(`/checkout?templateId=${payment.template_id}`);
  }

  // Check PDF exists — use service client so private bucket access isn't blocked by RLS
  const pdfUserId = payment.user_id ?? user.id;
  const pdfPath = `resumes/${pdfUserId}/${id}.pdf`;
  const { data: signed } = await getServiceClient()
    .storage.from("pdfs")
    .createSignedUrl(pdfPath, 60);
  const pdfExists = !!signed?.signedUrl;

  const daysLeft = daysUntil(payment.expires_at);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
        ↓
      </div>

      <div>
        <h1 className="text-2xl font-bold">Your resume is ready</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {daysLeft} day{daysLeft !== 1 ? "s" : ""} remaining to re-download
        </p>
      </div>

      {pdfExists ? (
        <a
          href={`/api/download-pdf/${id}`}
          className="w-full rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Download PDF
        </a>
      ) : (
        <p className="text-sm text-destructive">
          PDF not found.{" "}
          <Link
            href={`/checkout?templateId=${payment.template_id}`}
            className="underline"
          >
            Re-purchase to regenerate
          </Link>
        </p>
      )}

      <Link
        href="/dashboard"
        className="text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground"
      >
        ← Back to dashboard
      </Link>
    </main>
  );
}
