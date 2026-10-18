# Cvolt

A one-time-pay resume builder. Users fill in their details, browse templates with their own data previewed live, pay once, and download a PDF. No subscription.

**Stack:** Next.js (App Router) · Supabase (Postgres, Auth, Storage) · Tailwind + shadcn/ui · Zustand + React Hook Form + Zod · Puppeteer PDF generation · Stripe / Safepay

See [CLAUDE.md](CLAUDE.md) for the full architecture, database schema, routes and build plan.

## Prerequisites

- Node.js 20+
- Docker (running) — the database runs locally via the Supabase CLI
- ~4 GB of free RAM for the local Supabase containers

## Getting started

```bash
npm install
npm run db:start      # starts local Supabase in Docker (first run downloads images, several GB)
cp .env.example .env.local
```

Fill `.env.local` using the values printed by `npm run db:status`:

| Variable                         | Local value                         |
| -------------------------------- | ----------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`       | `http://127.0.0.1:54321`            |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`  | `ANON_KEY` from `db:status`         |
| `SUPABASE_SERVICE_ROLE_KEY`      | `SERVICE_ROLE_KEY` from `db:status` |
| `NEXT_PUBLIC_APP_URL`            | `http://localhost:3000`             |
| `STRIPE_*`, `SAFEPAY_SECRET_KEY` | Your test-mode keys                 |

Then start the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Local database (Supabase CLI)

The full Supabase stack (Postgres, Auth, Storage, REST) runs locally in Docker, so no application code differs between local and hosted Supabase — only the env values.

| Script              | What it does                                                       |
| ------------------- | ------------------------------------------------------------------ |
| `npm run db:start`  | Start the stack. Data persists between restarts in Docker volumes. |
| `npm run db:stop`   | Stop the stack and free memory.                                    |
| `npm run db:status` | Print URLs and keys.                                               |
| `npm run db:reset`  | Wipe the database, re-run all migrations and the seed.             |

**Local services**

| Service                              | URL                                                       |
| ------------------------------------ | --------------------------------------------------------- |
| API                                  | http://127.0.0.1:54321                                    |
| Studio (DB admin UI)                 | http://127.0.0.1:54323                                    |
| Mailpit (catches all outgoing email) | http://127.0.0.1:54324                                    |
| Postgres                             | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` |

**Notes**

- **Magic-link login:** emails are not actually sent locally. Request a link on `/login`, then open it from Mailpit.
- **Disabled services:** analytics, realtime, edge functions, vector and imgproxy are turned off (in [supabase/config.toml](supabase/config.toml) and the `db:start` script) to keep memory use low. Cvolt doesn't use them.
- **Auth redirects** are allowed for `http://localhost:3000/**` and `http://127.0.0.1:3000/**` (see `[auth]` in `config.toml`).

## Database schema & migrations

```
supabase/
├── config.toml                          # Local stack configuration
├── migrations/
│   ├── 20260101000000_init.sql          # Tables, RLS policies, auth.users → public.users trigger
│   └── 20260101000001_storage.sql       # Private `pdfs` bucket for generated resumes
└── seed.sql                             # Template records (runs automatically on start/reset)
```

To change the schema, add a new migration instead of editing an existing one:

```bash
npx supabase migration new <name>   # creates supabase/migrations/<timestamp>_<name>.sql
npm run db:reset                    # apply from scratch
```

## Payments (local testing)

Stripe webhooks need to reach your local server. With the [Stripe CLI](https://stripe.com/docs/stripe-cli):

```bash
stripe listen --forward-to localhost:3000/api/webhook/stripe
```

Use the `whsec_...` secret it prints as `STRIPE_WEBHOOK_SECRET`.

## Other scripts

| Command                           | What it does                                 |
| --------------------------------- | -------------------------------------------- |
| `npm run build`                   | Production build                             |
| `npm run lint`                    | ESLint                                       |
| `node scripts/download-fonts.mjs` | Download template fonts into `public/fonts/` |

## Deploying

The app deploys to Vercel ([vercel.json](vercel.json) sets function durations for the PDF and webhook routes). Production needs a hosted Postgres + Auth + Storage backend: either a hosted Supabase project (push the schema with `npx supabase link` then `npx supabase db push`) or a self-hosted Supabase instance. Set all variables from `.env.example` in the Vercel dashboard.
