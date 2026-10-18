-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ============================================================
-- TABLES
-- ============================================================

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now(),
  last_sign_in timestamptz
);

create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  title text not null default 'My Resume',
  personal_info jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.resume_sections (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid not null references public.resumes(id) on delete cascade,
  section_type text not null check (section_type in ('work','education','skills','certifications','languages','projects')),
  content jsonb not null default '{}',
  display_order int not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  thumbnail_url text not null default '',
  is_active boolean not null default true,
  category text not null check (category in ('clean','modern','creative')),
  created_at timestamptz not null default now()
);

-- payments.snapshot_id is nullable to break the circular FK dependency.
-- Insert order: payment (snapshot_id=null) → snapshot → update payment.snapshot_id
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  snapshot_id uuid, -- FK added below after resume_snapshots is created
  template_id uuid references public.templates(id) on delete set null,
  stripe_payment_id text,
  safepay_payment_id text,
  amount decimal(10,2) not null,
  currency text not null check (currency in ('usd','pkr')),
  status text not null default 'pending' check (status in ('pending','completed','failed')),
  purchased_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '30 days')
);

create table if not exists public.resume_snapshots (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid not null references public.resumes(id) on delete cascade,
  payment_id uuid not null references public.payments(id) on delete cascade,
  snapshot_data jsonb not null,
  char_count int not null default 0,
  created_at timestamptz not null default now()
);

-- Add the FK from payments → resume_snapshots now that the table exists
alter table public.payments
  add constraint payments_snapshot_id_fkey
  foreign key (snapshot_id) references public.resume_snapshots(id) on delete set null;

-- ============================================================
-- INDEXES
-- ============================================================

create index if not exists resumes_user_id_idx on public.resumes(user_id);
create index if not exists resume_sections_resume_id_idx on public.resume_sections(resume_id);
create index if not exists payments_user_id_idx on public.payments(user_id);
create index if not exists resume_snapshots_payment_id_idx on public.resume_snapshots(payment_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.users enable row level security;
alter table public.resumes enable row level security;
alter table public.resume_sections enable row level security;
alter table public.templates enable row level security;
alter table public.payments enable row level security;
alter table public.resume_snapshots enable row level security;

-- users: only own row
create policy "users_select_own" on public.users for select using (auth.uid() = id);
create policy "users_insert_own" on public.users for insert with check (auth.uid() = id);
create policy "users_update_own" on public.users for update using (auth.uid() = id);

-- resumes: only own rows
create policy "resumes_select_own" on public.resumes for select using (auth.uid() = user_id);
create policy "resumes_insert_own" on public.resumes for insert with check (auth.uid() = user_id);
create policy "resumes_update_own" on public.resumes for update using (auth.uid() = user_id);
create policy "resumes_delete_own" on public.resumes for delete using (auth.uid() = user_id);

-- resume_sections: own via parent resume
create policy "sections_select_own" on public.resume_sections for select
  using (exists (select 1 from public.resumes r where r.id = resume_id and r.user_id = auth.uid()));
create policy "sections_insert_own" on public.resume_sections for insert
  with check (exists (select 1 from public.resumes r where r.id = resume_id and r.user_id = auth.uid()));
create policy "sections_update_own" on public.resume_sections for update
  using (exists (select 1 from public.resumes r where r.id = resume_id and r.user_id = auth.uid()));
create policy "sections_delete_own" on public.resume_sections for delete
  using (exists (select 1 from public.resumes r where r.id = resume_id and r.user_id = auth.uid()));

-- templates: publicly readable, not writable by users
create policy "templates_select_all" on public.templates for select using (true);

-- payments: only own rows
create policy "payments_select_own" on public.payments for select using (auth.uid() = user_id);

-- resume_snapshots: own via parent payment
create policy "snapshots_select_own" on public.resume_snapshots for select
  using (exists (select 1 from public.payments p where p.id = payment_id and p.user_id = auth.uid()));

-- ============================================================
-- TRIGGER: auto-update resumes.updated_at
-- ============================================================

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger resumes_updated_at
  before update on public.resumes
  for each row execute function public.set_updated_at();

create trigger resume_sections_updated_at
  before update on public.resume_sections
  for each row execute function public.set_updated_at();

-- ============================================================
-- TRIGGER: auto-populate public.users on auth sign-up
-- Runs whenever a row is inserted into auth.users (magic link,
-- OAuth, admin.createUser, etc.) so FK references always resolve.
-- ============================================================

create or replace function public.handle_new_auth_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();
