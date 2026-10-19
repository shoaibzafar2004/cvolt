import Stripe from "stripe";

// Lazy singleton — not instantiated at module load so build-time collection
// doesn't fail when STRIPE_SECRET_KEY is absent.
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    // No apiVersion: each stripe-node release is built for (and pins) one API
    // version, and its types only accept that one. Upgrading the SDK is the
    // API upgrade — check Stripe's changelog for breaking changes when bumping.
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }
  return _stripe;
}

export async function createStripePaymentIntent({
  amountCents,
  currency,
  metadata,
}: {
  amountCents: number;
  currency: string;
  metadata: Record<string, string>;
}) {
  return getStripe().paymentIntents.create({
    amount: amountCents,
    currency,
    metadata,
    automatic_payment_methods: { enabled: true },
  });
}

export function verifyStripeWebhook(payload: string, sig: string) {
  return getStripe().webhooks.constructEvent(
    payload,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET!,
  );
}
