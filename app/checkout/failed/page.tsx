import Link from "next/link";
import { Suspense } from "react";

function FailedContent() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-8 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl">
        ✕
      </div>

      <div>
        <h1 className="text-2xl font-bold">Payment failed</h1>
        <p className="mt-2 text-muted-foreground">
          Your card was not charged. This can happen if your card was declined
          or the session expired.
        </p>
      </div>

      <Link
        href="/checkout"
        className="w-full rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        Try again
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

export default function FailedPage() {
  return (
    <Suspense>
      <FailedContent />
    </Suspense>
  );
}
