-- Lets a user remove a purchase from their dashboard. Payment rows are kept for
-- Stripe/accounting reconciliation; deleted_at hides them (the PDF and snapshot
-- are deleted by the app).
alter table public.payments add column if not exists deleted_at timestamptz;
