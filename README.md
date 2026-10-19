# Cvolt

A one-time-pay resume builder. Users fill in their details, browse templates with their own data previewed live, pay once, and download a PDF. No subscription.

**Stack:** Next.js (App Router) · Supabase (Postgres, Auth, Storage) · Tailwind + shadcn/ui · Zustand + React Hook Form + Zod · Puppeteer PDF generation · Stripe / Safepay

See [CLAUDE.md](CLAUDE.md) for the full architecture, database schema, routes and build plan.

## Features

- **5-step builder** (`/build`): personal info → work experience → projects & open-source contributions → education, skills, certifications, languages → summary. Drafts autosave to the browser; signed-in users sync to Supabase.
- **14 templates** with colour themes, previewed live with your own data in the gallery and on a full-size preview page (zoom slider, fit-to-screen).
- **One-time payment** (Stripe; Safepay planned) → server-rendered, pixel-perfect PDF via Puppeteer.
- **Dashboard** (magic-link login): re-download or edit purchases within 30 days; delete expired ones.

## Prerequisites

- Node.js 20+ (CI uses the version in `.nvmrc`)
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
│   ├── 20260101000001_storage.sql       # Private `pdfs` bucket for generated resumes
│   └── 20261018161730_payments_deleted_at.sql  # Soft-delete for purchases removed from the dashboard
└── seed.sql                             # Template records (runs automatically on start/reset)
```

To change the schema, add a new migration instead of editing an existing one:

```bash
npx supabase migration new <name> </dev/null   # creates supabase/migrations/<timestamp>_<name>.sql
npx supabase migration up                      # apply pending migrations, keeping your data
```

- `migration new` reads SQL from stdin when not attached to a terminal (scripts, AI agents), so it hangs without `</dev/null`.
- `npm run db:reset` also applies migrations but **wipes all local data** first — use it only when you want a clean database.
- Deploying: run `npx supabase db push` against the hosted project so it gets the same migrations.

## Payments (local testing)

A purchase is only recorded — payment row, resume copy, PDF — when the Stripe webhook reaches `/api/webhook/stripe`. Stripe can't reach `localhost`, so locally the [Stripe CLI](https://stripe.com/docs/stripe-cli) forwards events. Keep it running in its own terminal next to `npm run dev`:

```bash
stripe login                                                    # once; the CLI key expires after 90 days
stripe listen --forward-to localhost:3000/api/webhook/stripe
```

- **`--forward-to` is required.** Plain `stripe listen` only prints events and never calls the app, so payments succeed in Stripe but nothing appears on the dashboard.
- Use the `whsec_...` secret it prints as `STRIPE_WEBHOOK_SECRET` in `.env.local` (it stays the same across restarts; restart `npm run dev` if you change it).
- Pay with the test card `4242 4242 4242 4242`, any future expiry, any CVC.
- Each event should be followed by a response line:

  ```
  --> payment_intent.succeeded [evt_...]
  <-- [200] POST http://localhost:3000/api/webhook/stripe [evt_...]
  ```

  No `<--` line → the listener isn't forwarding (missing `--forward-to`). `[ERROR] … connection refused` → `npm run dev` isn't running. `[400]` → wrong `STRIPE_WEBHOOK_SECRET`. `[500]` → the handler failed; check the `npm run dev` output.

- `Expired API Key provided` from the CLI → run `stripe login` again.
- Missed a payment? `stripe events resend <evt_id>` replays it while the listener is running; the webhook skips payments it has already processed.

## Other scripts

| Command                           | What it does                                 |
| --------------------------------- | -------------------------------------------- |
| `npm run build`                   | Production build                             |
| `npm run lint`                    | ESLint                                       |
| `npm run typecheck`               | TypeScript check (`tsc --noEmit`)            |
| `npm test`                        | Unit tests (Vitest, `tests/unit/`)           |
| `npm run test:watch`              | Unit tests in watch mode                     |
| `npm run format`                  | Format all files with Prettier               |
| `npm run format:check`            | Check formatting without writing (CI)        |
| `node scripts/download-fonts.mjs` | Download template fonts into `public/fonts/` |

## Git workflow

```
feature branch ──PR──▶ develop ──PR──▶ main
```

- `main` is release-only. Nothing is committed or merged into it except PRs from `develop`.
- Every change gets its own branch off `develop` (`feat/…`, `fix/…`, `chore/…`) and a PR into `develop`.
- Dependabot opens weekly dependency PRs against `develop` (minor/patch grouped, majors separate).
- A pre-commit hook (Husky + lint-staged) runs ESLint `--fix` and Prettier on staged files. It installs automatically with `npm install`.
- CI (`.github/workflows/ci.yml`) runs format check, lint, typecheck and build on every PR to `develop` and `main`.
- `main-guard` fails any PR into `main` whose source isn't `develop`.
- Use **merge commits** (not squash) for `develop` → `main`, so both branches keep the same history.
- After a bulk reformat, add the commit hash to `.git-blame-ignore-revs`. Locally, enable it once with `git config blame.ignoreRevsFile .git-blame-ignore-revs`.

## Deploying

The app deploys to Vercel ([vercel.json](vercel.json) sets function durations for the PDF and webhook routes). Production needs a hosted Postgres + Auth + Storage backend: either a hosted Supabase project (push the schema with `npx supabase link` then `npx supabase db push`) or a self-hosted Supabase instance. Set all variables from `.env.example` in the Vercel dashboard.
