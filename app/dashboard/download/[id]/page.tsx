import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { daysUntil } from "@/lib/utils";
import { FREE_EDIT_LIMIT } from "@/lib/resume-diff";
import { getPurchase, getServiceClient, reeditStatus } from "@/lib/purchases";

interface Props {
  params: Promise<{ id: string }>;
}

const pct = (n: number) =>
  n > 0 && n < 0.01 ? "<1%" : `${Math.round(n * 100)}%`;

// Re-download gate. Within 30 days and with edits under the free limit the
// (re-rendered) PDF is free; otherwise buying again creates a new resume and
// this purchase goes back to what was bought.
export default async function DownloadPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?returnTo=/dashboard/download/${id}`);

  const purchase = await getPurchase(getServiceClient(), id, user.id);
  if (!purchase) notFound();

  const status = reeditStatus(purchase);
  const daysLeft = daysUntil(purchase.expiresAt);
  const buyAgainHref = `/checkout?templateId=${purchase.templateId}&resumeId=${purchase.resumeId}`;
  const editHref = `/dashboard/edit/${purchase.resumeId}`;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 px-4 text-center">
      <div
        className={`flex h-16 w-16 items-center justify-center rounded-full text-3xl ${status.free ? "bg-green-100" : "bg-amber-100"}`}
      >
        {status.free ? "↓" : "!"}
      </div>

      {status.free ? (
        <>
          <div>
            <h1 className="text-2xl font-bold">Your resume is ready</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {daysLeft} day{daysLeft !== 1 ? "s" : ""} left for free edits
              {status.change > 0 &&
                ` · ${pct(status.change)} changed of ${pct(FREE_EDIT_LIMIT)} free`}
            </p>
          </div>
          <a
            href={`/api/download-pdf/${id}`}
            className="w-full rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Download PDF
          </a>
          {status.change > 0 && (
            <p className="-mt-3 text-xs text-muted-foreground">
              Your edits are included — the PDF may take a few seconds.
            </p>
          )}
        </>
      ) : (
        <>
          <div>
            <h1 className="text-2xl font-bold">
              {status.expired
                ? "This purchase has expired"
                : "Too many changes for a free update"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {status.expired
                ? "Free edits and downloads last 30 days."
                : `You've changed ${pct(status.change)} of this resume; free updates allow up to ${pct(FREE_EDIT_LIMIT)}.`}{" "}
              Buying again adds it to your dashboard as a new resume
              {status.expired
                ? "."
                : ", and this one goes back to the version you bought."}
            </p>
          </div>
          <Link
            href={buyAgainHref}
            className="w-full rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Buy as a new resume — $1.50
          </Link>
          {!status.expired && (
            <Link
              href={editHref}
              className="text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground"
            >
              Keep editing
            </Link>
          )}
        </>
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
