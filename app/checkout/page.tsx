export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createStripePaymentIntent } from "@/lib/payments";
import { createClient } from "@/lib/supabase/server";
import CheckoutForm from "./CheckoutForm";
import TemplateThumbnail from "./TemplateThumbnail";

interface Props {
  searchParams: Promise<{
    templateId?: string;
    slug?: string;
    name?: string;
    resumeId?: string;
  }>;
}

const PRICE_CENTS = 150;
const CURRENCY = "usd";

export default async function CheckoutPage({ searchParams }: Props) {
  const {
    templateId,
    slug: slugParam,
    name: nameParam,
    resumeId: resumeParam,
  } = await searchParams;

  if (!templateId) {
    redirect("/templates");
  }

  const supabase = await createClient();

  // Fetch template info — slug + name from URL params are fallbacks if DB query fails
  const { data: template } = templateId
    ? await supabase
        .from("templates")
        .select("id, name, slug")
        .eq("id", templateId)
        .single()
    : { data: null };

  const displayName =
    template?.name ?? (nameParam ? decodeURIComponent(nameParam) : null);
  const displaySlug = template?.slug ?? slugParam ?? null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Require login before checkout — prevents payment being attributed to a wrong email
  if (!user) {
    redirect(`/login?returnTo=/checkout?templateId=${templateId}`);
  }

  const userEmail = user.email ?? null;

  // Buying a specific resume (e.g. a re-edited purchase from the dashboard):
  // only accepted when it belongs to this user (RLS-scoped query)
  const { data: ownedResume } = resumeParam
    ? await supabase
        .from("resumes")
        .select("id, purchased")
        .eq("id", resumeParam)
        .eq("user_id", user.id)
        .maybeSingle()
    : { data: null };
  const resumeId = ownedResume?.id ?? null;

  // Create PaymentIntent server-side — never trust client for amount
  const intent = await createStripePaymentIntent({
    amountCents: PRICE_CENTS,
    currency: CURRENCY,
    metadata: {
      templateId: templateId ?? "",
      ...(user?.id ? { userId: user.id } : {}),
      ...(user?.email ? { email: user.email } : {}),
      ...(resumeId ? { resumeId } : {}),
    },
  });

  return (
    <main className="mx-auto max-w-lg px-4 py-12">
      <h1 className="mb-8 text-2xl font-bold">Checkout</h1>

      {/* Order summary */}
      <div className="mb-8 flex items-center gap-4 rounded-xl border bg-card p-4">
        {/* Live mini preview */}
        <div className="shrink-0 overflow-hidden rounded-lg border bg-white shadow-sm">
          {displaySlug ? (
            <TemplateThumbnail slug={displaySlug} />
          ) : (
            <div className="flex h-28 w-20 items-center justify-center bg-muted text-xs text-muted-foreground">
              Preview
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold">
            {displayName ?? "Resume template"}
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            One-time download
          </p>
          <p className="text-xs text-muted-foreground">
            30-day re-download included
          </p>
        </div>

        <p className="shrink-0 text-xl font-bold">$1.50</p>
      </div>

      <CheckoutForm
        clientSecret={intent.client_secret!}
        templateId={templateId ?? ""}
        userEmail={userEmail}
        resumeId={resumeId}
        fromPurchase={Boolean(ownedResume?.purchased)}
        publishableKey={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!}
      />
    </main>
  );
}
