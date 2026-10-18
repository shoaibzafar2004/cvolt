import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";

async function SuccessContent({ paymentId }: { paymentId: string }) {
  const supabase = await createClient();

  const { data: payment } = await supabase
    .from("payments")
    .select("id, expires_at, purchased_at")
    .eq("id", paymentId)
    .single();

  const expiresAt = payment?.expires_at ? new Date(payment.expires_at) : null;
  const now = new Date();
  const daysLeft = expiresAt
    ? Math.max(
        0,
        Math.ceil(
          (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        ),
      )
    : 30;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-8 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
        ✓
      </div>

      <div>
        <h1 className="text-2xl font-bold">Payment confirmed!</h1>
        <p className="mt-2 text-muted-foreground">
          Your resume PDF is ready. Check your email for a download link too.
        </p>
      </div>

      <Link
        href={`/dashboard/download/${paymentId}`}
        className="w-full rounded-lg bg-primary px-6 py-3 text-lg font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        Download resume
      </Link>

      <div className="w-full rounded-lg border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{daysLeft} days</span>{" "}
        remaining to re-download
      </div>

      <Link
        href="/dashboard"
        className="text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground"
      >
        View my dashboard
      </Link>
    </main>
  );
}

interface Props {
  searchParams: Promise<{ paymentId?: string }>;
}

export default async function SuccessPage({ searchParams }: Props) {
  const { paymentId } = await searchParams;
  if (!paymentId) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">No payment found.</p>
      </main>
    );
  }
  return (
    <Suspense>
      <SuccessContent paymentId={paymentId} />
    </Suspense>
  );
}
