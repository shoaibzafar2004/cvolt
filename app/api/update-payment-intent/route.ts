import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
});

export async function POST(request: Request) {
  const { intentId, email } = await request.json();

  if (!intentId || !email) {
    return Response.json(
      { error: "intentId and email required" },
      { status: 400 },
    );
  }

  await stripe.paymentIntents.update(intentId, {
    receipt_email: email,
    metadata: { email },
  });

  return Response.json({ ok: true });
}
