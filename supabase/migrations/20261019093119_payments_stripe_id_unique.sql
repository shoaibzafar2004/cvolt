-- One payment row per Stripe PaymentIntent. Stripe retries webhooks that fail,
-- so the handler reuses the existing row; this index guards against two
-- deliveries racing each other.
create unique index if not exists payments_stripe_payment_id_key
  on public.payments (stripe_payment_id)
  where stripe_payment_id is not null;
