"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { useResumeStore } from "@/store/resumeStore";
import { useUIStore } from "@/store/uiStore";

interface CheckoutFormProps {
  clientSecret: string;
  templateId: string;
  publishableKey: string;
  userEmail: string | null;
}

export default function CheckoutForm({
  clientSecret,
  templateId,
  publishableKey,
  userEmail,
}: CheckoutFormProps) {
  const router = useRouter();
  const personalInfo = useResumeStore((s) => s.personalInfo);
  const draftReady = useUIStore((s) => s.draftReady);

  // Only once the draft has loaded (localStorage or DB) — otherwise a
  // signed-in user with an empty browser draft is bounced to /build
  useEffect(() => {
    if (draftReady && !personalInfo.name) {
      router.replace("/build");
    }
  }, [draftReady, personalInfo.name, router]);

  // userEmail is always set — checkout page redirects to login if not authenticated

  // loadStripe must be stable — memoize so it's not recreated on every render
  const stripePromise = useMemo(
    () => loadStripe(publishableKey),
    [publishableKey],
  );

  return (
    <Elements
      stripe={stripePromise}
      options={{ clientSecret, appearance: { theme: "stripe" } }}
    >
      <InnerForm
        templateId={templateId}
        clientSecret={clientSecret}
        userEmail={userEmail}
      />
    </Elements>
  );
}

function InnerForm({
  templateId,
  clientSecret,
  userEmail,
}: {
  templateId: string;
  clientSecret: string;
  userEmail: string | null;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const resumeId = useResumeStore((s) => s.resumeId);
  const [email] = useState(userEmail ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message ?? "Something went wrong");
      setLoading(false);
      return;
    }

    // Attach email + resume to the PaymentIntent so the webhook snapshots the
    // resume being bought (read from intent.metadata)
    await fetch("/api/update-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        intentId: clientSecret.split("_secret_")[0],
        email,
        resumeId,
      }),
    });

    const returnUrl = `${window.location.origin}/checkout/processing?templateId=${templateId}&email=${encodeURIComponent(email)}`;

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl, receipt_email: email },
    });

    if (confirmError) {
      setError(confirmError.message ?? "Payment failed");
      setLoading(false);
    }
    // On success Stripe redirects to return_url automatically
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-4 py-3 text-sm">
        <span className="text-muted-foreground">Sending receipt to</span>
        <span className="font-medium text-foreground">{userEmail}</span>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Payment</label>
        <div className="rounded-lg border p-4">
          <PaymentElement />
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" className="w-full" disabled={!stripe || loading}>
        {loading ? "Processing..." : "Pay $1.50 and download"}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        No subscription. No refunds after PDF download.
      </p>
    </form>
  );
}
