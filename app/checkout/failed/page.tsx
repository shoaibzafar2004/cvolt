import Link from "next/link";
import { Suspense } from "react";

function FailedContent({ processing }: { processing: boolean }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-8 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl">
        ✕
      </div>

      <div>
        <h1 className="text-2xl font-bold">
          {processing ? "We're still preparing your PDF" : "Payment failed"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {processing
            ? "Your payment went through, but generating your PDF hit a problem. We retry automatically — it will appear in your dashboard shortly. Please don't pay again."
            : "Your card was not charged. This can happen if your card was declined or the session expired."}
        </p>
      </div>

      <Link
        href={processing ? "/dashboard" : "/checkout"}
        className="w-full rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        {processing ? "Go to dashboard" : "Try again"}
      </Link>

      <Link
        href="/templates"
        className="text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground"
      >
        ← Back to templates
      </Link>
    </main>
  );
}

export default async function FailedPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;
  return (
    <Suspense>
      <FailedContent processing={reason === "processing"} />
    </Suspense>
  );
}
