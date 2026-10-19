# Cvolt — Project Guide

---

## 1. What We're Building

**Cvolt** is a one-time-pay resume builder web app. The core differentiator is no subscription — users fill in their details, browse templates Netflix-style with their real data previewed live, pay once (~$1.50–$3), and download a PDF.

**Target users:** Fresh graduates, job switchers, and people in developing markets who need one good resume without a monthly commitment.

**Business model:** Single payment per resume. No account needed to build; signing in (magic link) is required at checkout, and every purchase appears on the dashboard.

---

## 2. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend framework | Next.js 16 (App Router, Turbopack) + React 19 | Zero-config Vercel deploy, RSC + API routes built in. Next 16 has breaking changes — see AGENTS.md |
| Hosting | Vercel | Free tier, serverless, no VPS needed |
| Database + Auth + Storage | Supabase (local via Supabase CLI in Docker for dev) | Relational model fits resume data, PDF storage bucket included, better than Firebase for this shape |
| Styling | Tailwind CSS v4 + shadcn/ui (Base UI primitives) + next-themes | Fast, accessible components; light/dark theme |
| State management | Zustand + React Hook Form | Zustand for global resume data, RHF scoped per step with Zod validation |
| Rich text / reorder | Tiptap + @dnd-kit | Bullet-point editor, drag-to-reorder entries |
| PDF generation | @sparticuz/chromium + Puppeteer | Server-side render of real React components = pixel-perfect PDFs |
| Payments (global) | Stripe | Card payments worldwide |
| Payments (Pakistan) | Safepay — planned, not live yet | Local payment coverage for developing market users |
| Testing | Vitest | Unit tests + integration tests against local Supabase |

---

## 3. Database Schema

Six tables. All IDs are UUIDs. **Source of truth: `supabase/migrations/`** — this section is a summary.

### users
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK, from Supabase Auth |
| email | text | |
| created_at | timestamp | |
| last_sign_in | timestamp | |

### resumes
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → users |
| title | text | e.g. "Software Engineer Resume" |
| purchased | boolean | false = a /build draft; true = the resume owned by one purchase (copied by the webhook, linked via `resume_snapshots.resume_id`) |
| personal_info | jsonb | name, email, phone, location, LinkedIn, GitHub, website |
| created_at | timestamp | |
| updated_at | timestamp | |

### resume_sections
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| resume_id | uuid | FK → resumes |
| section_type | text | 'work', 'education', 'skills', 'projects', etc. |
| content | jsonb | Flexible per section type |
| display_order | int | For drag-to-reorder |
| updated_at | timestamp | |

### templates
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| name | text | Display name |
| slug | text | URL key, maps to React component |
| thumbnail_url | text | Static image in /public |
| is_active | boolean | Toggle templates on/off |
| category | text | 'clean', 'modern' or 'creative' (gallery filter) |
| created_at | timestamp | |

### payments
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → users |
| snapshot_id | uuid | FK → resume_snapshots |
| template_id | uuid | FK → templates |
| stripe_payment_id | text | Nullable |
| safepay_payment_id | text | Nullable |
| amount | decimal | |
| currency | text | 'usd' or 'pkr' |
| status | text | 'pending', 'completed', 'failed' |
| purchased_at | timestamp | |
| expires_at | timestamp | 30 days from purchase |
| pdf_hash | text | Hash of the template + resume content the stored PDF was rendered from; a free re-edit re-renders when it no longer matches |
| deleted_at | timestamp | Nullable. Set when the user deletes an expired purchase from the dashboard (row kept for reconciliation; PDF + snapshot are deleted). All payment queries filter `deleted_at is null` |

### resume_snapshots
Frozen copy of resume data at time of payment. Prevents edits from breaking purchased downloads.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| resume_id | uuid | FK → resumes |
| payment_id | uuid | FK → payments |
| snapshot_data | jsonb | Complete frozen ResumeData |
| char_count | int | For diff calculation |
| created_at | timestamp | |

**Storage:** private `pdfs` bucket, files at `resumes/{userId}/{paymentId}.pdf`, served via signed URLs from the service-role client.

---

## 4. Folder Structure

```
cvolt/
├── app/
│   ├── layout.tsx                      # Root shell, fonts, ThemeProvider
│   ├── page.tsx                        # Landing /
│   ├── not-found.tsx
│   ├── build/                          # page.tsx (step router), loading.tsx
│   ├── templates/
│   │   ├── page.tsx                    # Gallery (server) → TemplateGallery.tsx (client)
│   │   └── [slug]/                     # page.tsx → TemplatePreview.tsx
│   ├── checkout/
│   │   ├── page.tsx                    # Server shell → CheckoutForm.tsx, TemplateThumbnail.tsx
│   │   ├── processing/page.tsx
│   │   ├── success/page.tsx
│   │   └── failed/page.tsx
│   ├── dashboard/
│   │   ├── layout.tsx                  # Wraps everything in AuthGate
│   │   ├── page.tsx                    # Purchase cards (active: Edit + Download, expired: Delete)
│   │   ├── actions.ts                  # Server actions: deleteExpiredPurchase
│   │   ├── DeleteResumeButton.tsx      # Delete + confirm dialog (client)
│   │   ├── edit/[id]/                  # [id] = resume id. page.tsx (server) → EditFormShell.tsx (client)
│   │   └── download/[id]/page.tsx      # Re-download / free re-edit gate
│   ├── api/
│   │   ├── download-pdf/[paymentId]/route.ts   # Serves the PDF; re-renders after a free re-edit
│   │   ├── payment-status/route.ts
│   │   ├── update-payment-intent/route.ts
│   │   ├── webhook/stripe/route.ts
│   │   └── webhook/safepay/route.ts
│   ├── auth/callback/route.ts          # Magic-link code exchange
│   ├── login/page.tsx
│   ├── privacy/page.tsx
│   └── terms/page.tsx
│
├── components/
│   ├── build/                          # StepWrapper, Step1–5, WorkBlock, ProjectBlock, TagInput,
│   │                                   #   BulletEditor (Tiptap), PhotoCropModal
│   ├── templates/                      # TemplateCard, FilterBar, ThemePicker
│   ├── resume-templates/               # THE CRITICAL FOLDER — one *Template.tsx per design (14),
│   │                                   #   ClientOnlyTemplate.tsx (client-only render wrapper),
│   │                                   #   ContactIcons.tsx (inline SVG icon set), CertExtras.tsx,
│   │                                   #   ResumeLink.tsx (clickable links in PDFs),
│   │                                   #   pagination.ts (shared print page-break styles)
│   ├── ui/                             # shadcn components (badge, button, dialog, input, select,
│   │                                   #   sheet, skeleton, textarea) + custom month-picker
│   └── shared/                         # Navbar, Footer, AuthGate, LogoutButton, SectionLine,
│                                       #   ThemeProvider, ThemeToggle, ResumeDraftLoader
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                   # Browser client
│   │   └── server.ts                   # RSC + API routes
│   ├── pdf.ts                          # Puppeteer + chromium
│   ├── schemas.ts                      # All Zod schemas
│   ├── payments.ts                     # Stripe + Safepay helpers
│   ├── purchases.ts                    # Server: purchase lookup, resume copy/revert, PDF render+store, re-edit status
│   ├── resume-diff.ts                  # Word-level change ratio + FREE_EDIT_LIMIT (10%)
│   ├── load-draft.ts                   # Client: load latest draft from DB into the store
│   ├── templates.ts                    # Registry: slug → component, plus per-template themes
│   ├── build-steps.ts                  # BUILD_STEPS / TOTAL_STEPS — single source for the /build steps
│   ├── resume-format.ts                # Template display helpers: dateRange, projectMeta, displayUrl
│   ├── cropImage.ts                    # Canvas helper for the photo cropper
│   └── utils.ts                        # cn(), daysUntil(), shapeDbRowToResumeData
│
├── store/
│   ├── resumeStore.ts                  # personalInfo, sections[], resumeId, purchaseId, purchaseTemplateId, mode, isDirty
│   └── uiStore.ts                      # currentStep, activeFilter, loading, draftReady
│
├── types/index.ts                      # ResumeData, WorkEntry, Template, Payment
├── hooks/useMounted.ts                 # true only after hydration (client-only rendering)
│
├── supabase/
│   ├── config.toml                     # Local Supabase stack config
│   ├── migrations/                     # Schema, RLS, triggers, storage bucket — source of truth
│   └── seed.sql                        # Template records, applied on start/reset
│
├── scripts/download-fonts.mjs          # Fetches template fonts into public/fonts/
│
├── tests/                              # unit/ (Vitest), integration/ (real Supabase), fixtures.ts
├── vitest.config.ts                    # Unit tests; vitest.integration.config.ts for integration
│
└── public/
    ├── fonts/                          # Self-hosted fonts used by resume templates
    └── templates/                      # Static thumbnails
```

**Key rules:**
- `components/resume-templates/` uses inline styles + CSS vars ONLY. Tailwind never enters this folder. Puppeteer renders these without a Next.js context.
- `lib/templates.ts` is the registry `{ "clean": CleanTemplate, ... }` used by the gallery, detail page, `ClientOnlyTemplate` and PDF API route — one source of truth. Adding a template = new component + registry entry + seed row.
- Two Supabase clients: `client.ts` for browser, `server.ts` for RSC and API routes.
- Two Zustand stores: `resumeStore` owns resume data; `uiStore` owns step, filter, loading state.
- Local development runs the full Supabase stack via the CLI (`npm run db:start`); see README.md for setup, URLs and keys.

---

## 5. All Routes

### Public (no auth required)

| Route | Description |
|---|---|
| `/` | Landing — hero, value prop, how it works, 3 template previews, pricing, FAQ, footer |
| `/build` | Multi-step form router for drafts. Auto-saves to localStorage on blur, syncs to Supabase on step complete. `?new=1` starts a fresh draft ("New resume"); a purchased resume left in the store is swapped for the latest draft |
| `/build?step=1` | Personal info — name, job title, email, phone, location, LinkedIn, GitHub, website, photo |
| `/build?step=2` | Work experience — repeatable blocks, rich text bullet points, add/remove/reorder |
| `/build?step=3` | Projects & open-source contributions (optional) — type, role, link, dates, highlights, tech stack; reorderable |
| `/build?step=4` | Education + skills + optional extras (certifications with link + skills, languages). Toggle sections on/off |
| `/build?step=5` | Professional summary (optional/skippable) + mini preview of completed resume |
| `/templates` | Gallery — CSS grid, live previews at ~30% zoom with real user data, filter bar |
| `/templates/[slug]` | Full-size preview — left: rendered resume with back button + zoom (−/slider/+/Fit, 100% = real A4 size), right: template info, theme picker, "Edit your resume" step links, "Use this — $1.50" CTA |

### Payment flow

| Route | Description |
|---|---|
| `/checkout` | Requires login. Order summary + Stripe Payment Element (Safepay not live yet). `?resumeId=` buys that resume (owner-checked) — used for "Buy as a new resume"; otherwise the store's draft |
| `/checkout/processing` | Polls `/api/payment-status` while the webhook creates the purchase + PDF. Redirects to /checkout/success (or /checkout/failed) |
| `/checkout/success` | Download button + 30-day re-download note |
| `/checkout/failed` | Error reason shown. "Try again" preserves form state |

### Authenticated (requires login)

| Route | Description |
|---|---|
| `/dashboard` | Purchased resumes. Active: Edit (→ `/dashboard/edit/[resumeId]`) + Download. Expired: Delete only (confirm dialog → `deleteExpiredPurchase` server action in `app/dashboard/actions.ts`) |
| `/dashboard/edit/[id]` | `[id]` = a purchase's own resume. Same multi-step form as /build, loaded from the server; finishes with "Save & get PDF" → its download page |
| `/dashboard/download/[id]` | Gate: within 30 days + word diff ≤10% vs the purchased snapshot? Serve the PDF, re-rendered with the edits. Otherwise offer "Buy as a new resume" → /checkout?resumeId= |
| `/login` | Magic link only. Email input → "Check your inbox" → redirect to /dashboard |

### Static / utility

| Route | Description |
|---|---|
| `/privacy` | Required for Stripe + Safepay approval |
| `/terms` | No refunds after PDF download |
| `/404` | Not found, link back home |

---

## 6. Build Form Flow

5 steps, single direction, progress bar with 5 pills.

**State architecture:**
- `useResumeStore` (Zustand) holds: `personalInfo`, `sections[]`, `resumeId`, `purchaseId` + `purchaseTemplateId` (set only while editing a purchase), `mode` ('create' | 'edit'), `isDirty`, `lastSaved`, `hydrateCount`. `currentStep` lives in `uiStore`
- Each step mounts its own `useForm()` with a Zod schema passed as `zodResolver`
- On Next: RHF `handleSubmit` validates → merges into Zustand → step + 1
- On Back: no validation, data already in Zustand

**Persistence:**
- localStorage (`cvolt_draft`) writes on every field blur
- On page load `ResumeDraftLoader` (root layout) keeps the localStorage draft if there is one; if it's empty and the user is signed in, it loads their latest resume from Supabase. Pages that need the draft wait for `uiStore.draftReady`
- Supabase save on step completion (signed-in users only)

**Validation:**
- Steps 1–4: validate on Next (step 3 accepts an empty project list)
- Step 5: always skippable
- Schemas: `personalInfoSchema`, `workEntrySchema`, `educationSchema`, `skillsSchema` — all in `lib/schemas.ts`

**After step 5:** Push to `/templates`. Resume data passed via Zustand store.

**Edit mode (`/dashboard/edit/[id]`):**
The page is a React Server Component. It fetches the purchased resume server-side (drafts redirect to /build), checks auth, looks up its payment + template, and passes them to `EditFormShell`. Once `uiStore.draftReady` is set, the shell always calls `store.hydrate(data, id, { paymentId, templateId })` — the browser copy can be stale — and only mounts the steps after that hydrate (`hydrateCount`), so each step's `defaultValues` are the server data.

---

## 7. Template Gallery Architecture

**Data sources on `/templates` mount:**
- `resumeData` from Zustand store (user's filled-in data)
- `templates[]` from Supabase (static, cached)
- `payments[]` from Supabase (auth user only — determines CTA state)

**Template card grid:** CSS grid, 1–4 cols by viewport. Each card contains:
- Live preview div: `<TemplateComponent>` at full A4 size, CSS `scale()` to ~30%, `pointer-events: none`
- Template name + price
- CTA button: "Fill in resume first" (no data), "Use this — $1.50", "Re-download" (active purchase of that template), "Purchase again" (expired)

**Template component contract:**
- Pure React component, props: `ResumeData`, no external fetch
- Same component used by gallery, detail page, AND PDF API route
- Inline styles + CSS vars only. No Tailwind. No exceptions.
- Fonts via `@font-face` inside each template
- Section order in every template: Work → Projects → Education (where they share a column). Project date/meta/link formatting comes from `lib/resume-format.ts`
- Contact rows (phone, email, location, website, LinkedIn, GitHub) use the icons in `ContactIcons.tsx` — never text glyphs (◉ ⊕ ✆). Icons inherit colour and size (`currentColor`, `1em`).
- Certification link + skills render through `<CertExtras>` with the template's own link/muted colours
- Every email, phone, URL (contact rows, project links) renders through `<ResumeLink>` so it is a live link in the PDF. Never wrap a template preview in `<a>`/`<Link>` — use an overlay link (nested `<a>` is invalid HTML)
- PDF page breaks use `pagination.ts`: work/project entries may split between bullets (`NO_SPLIT` on bullets/tag rows, `KEEP_WITH_PREV` on the first bullet, `KEEP_WITH_NEXT` on entry headers and section titles), `REPEAT_PADDING` on page columns so continuation pages get margins, and `printPageBackground()` for coloured columns
- When adding a field, update every template and add it to `tests/fixtures.ts` — `tests/unit/templates.test.tsx` renders all 14 with renderToStaticMarkup (full + minimal data, links, no nested `<a>`, no `class=`). Layout/pagination still needs a visual check: there is no automated visual test suite

---

## 8. PDF Generation

`renderAndStorePdf()` in `lib/purchases.ts` — called by the Stripe webhook (new purchase) and by `GET /api/download-pdf/[paymentId]` (free re-edit, when `payments.pdf_hash` is stale). There is no public "generate PDF" endpoint.

```
1. Look up the component from lib/templates.ts registry (by template slug)
2. ReactDOMServer.renderToStaticMarkup(<Template data={data} />)
3. lib/pdf.ts wraps it in a full HTML document (<base href> for /fonts)
4. Launch @sparticuz/chromium + Puppeteer
5. page.setContent(html) → page.pdf({ format: 'A4', printBackground: true })
6. Upload to the private `pdfs` bucket at resumes/{userId}/{paymentId}.pdf (upsert)
7. Store payments.pdf_hash (template + resume content) for staleness checks
```

---

## 9. Payment Flow

**Checkout → PDF → download:**
1. User submits checkout form
2. Payment intent created server-side
3. Stripe webhook fires on success (`stripe listen --forward-to` locally — see README)
4. Webhook: create (or reuse) payment record → copy the resume being bought into a new purchased resume → freeze snapshot → generate PDF → upload → mark completed → if the source was a re-edited purchase, revert it to its own snapshot
5. Processing page polls status → redirects to /checkout/success
6. /checkout/success shows the download button + 30-day re-download note

**Purchases own their resume.** Every completed payment gets its own resume (`resumes.purchased = true`); the /build draft and other purchases are never affected by editing it. Dashboard "Edit" edits that purchase's resume (`/dashboard/edit/[resumeId]`, finishing at its download page); "New resume" is `/build?new=1`.

**Re-download / free re-edit gate (`/dashboard/download/[id]`, enforced again in `/api/download-pdf/[paymentId]`):**
- Within 30 days of purchase, and word-level change ≤10% of the purchased snapshot (cumulative, `lib/resume-diff.ts`) → free: the PDF is re-rendered when `payments.pdf_hash` no longer matches, then served.
- Otherwise → "Buy as a new resume": paying creates a new purchase with the edited content, and the original purchase reverts to what was bought.
- A purchase always renders with its own template (`payments.template_id`). Colour theme (`personalInfo.theme`) changes on that template are free and don't count toward the 10%. Picking a different template while editing a purchase is a new purchase (new resume) — the gallery, template page and checkout say so (`resumeStore.purchaseId` / `purchaseTemplateId`).
- `ThemePicker` saves the theme to the resume row as well as the store — PDFs are rendered from the DB copy.

---

## 10. Auth Flow

Magic link only. Anyone can build without an account (draft in localStorage); checkout requires signing in, so every purchase belongs to an account. The webhook sends no email. `AuthGate` server component wraps all `/dashboard/*` routes.

---

## 11. Rules for Claude Code

### Template components (components/resume-templates/)
- Inline styles ONLY. Never import or use Tailwind classes.
- No hooks, no browser APIs, no external fetches.
- Must render identically in browser AND via ReactDOMServer.renderToStaticMarkup().
- A4 size: width 794px, height 1123px.
- Fonts via @font-face in a <style> JSX tag inside the component, not via next/font or link.

### Supabase
- Development uses local Supabase (`npm run db:start`); there is no hosted dev project.
- Schema changes go in a NEW file via `npx supabase migration new <name> </dev/null` (without `</dev/null` it waits for SQL on stdin when not run in a terminal). Never edit an applied migration.
- Apply new migrations locally with `npx supabase migration up` — keeps data. `npm run db:reset` wipes local data and re-applies migrations + seed; don't run it without asking.
- Payment rows are never hard-deleted; queries on `payments` must filter `deleted_at is null`.
- Use lib/supabase/client.ts in 'use client' components only.
- Use lib/supabase/server.ts in server components and API route handlers.
- Never import the browser client in a server context — it will throw.

### Zustand
- resumeStore owns all resume data (personalInfo, sections, resumeId, mode, isDirty).
- uiStore owns all ephemeral UI state (currentStep, activeFilter, isLoading).
- Never put UI state in resumeStore or data state in uiStore.

### Forms
- Each /build step gets its own useForm() instance, scoped to that step only.
- Always pass zodResolver(stepSchema) to useForm({ resolver }).
- defaultValues always come from the Zustand store — never from local useState.

### Payments
- Never trust client-side payment confirmation.
- Mark payments complete ONLY inside the webhook handler after signature verification.
- The webhook copies the resume being bought (`metadata.resumeId`) into a new purchased resume, snapshots it, triggers PDF generation, and marks the payment `completed` (or `failed` on error). It is idempotent per `stripe_payment_id` — Stripe retries reuse the same row and replace the previous attempt's copy.
- Never edit a purchase's snapshot; it is the baseline for the free re-edit diff.

### React / lint
- `npm run lint` must report zero errors.
- Client-only rendering: use `useMounted()` from hooks/useMounted.ts — never `useState` + `useEffect(() => setMounted(true))`.
- No impure calls (`Date.now()`, `Math.random()`) directly in a component body; put them in a helper (e.g. `daysUntil()` in lib/utils.ts).
- Look up template components from `registry` in lib/templates.ts; don't hand-write slug → component switches.

### Git & formatting
- Never commit to `main` or `develop` directly. Branch off `develop` (`feat/`, `fix/`, `chore/`), PR into `develop`. Only `develop` → `main` PRs update main.
- Code is formatted by Prettier with its default style (semicolons, double quotes, width 80) plus Tailwind class sorting. Don't hand-format; let Prettier do it. Run `npm run format` before committing; CI runs `format:check`, `lint`, `typecheck`, `test` and `build` as separate parallel jobs (Format, Lint, Typecheck, Unit tests, Build); any failure blocks the PR.

### Tests
- Unit tests: Vitest, `tests/unit/**/*.test.ts(x)`, run with `npm test`. Shared resume fixtures in `tests/fixtures.ts`. `@/` resolves to the repo root; `server-only` is stubbed so server helpers (e.g. `lib/purchases.ts`) can be tested.
- Integration tests: `npm run test:integration` (`tests/integration/`, `vitest.integration.config.ts`) call the real route handlers (Stripe webhook, `/api/download-pdf`) against the local Supabase stack — start it first (`npm run db:start`); URLs/keys come from `supabase status`. Webhook events are HMAC-signed the way Stripe signs them; only the cookie-based `getUser()` is mocked. Each run uses a throwaway user and deletes everything it created. CI runs them in the Integration tests job (`supabase start` in Docker).
- Tests never ship: nothing in `app/` imports `tests/`, so they aren't bundled, and `.vercelignore` keeps them out of deployments.
- Add or update tests with any change to `lib/resume-diff.ts`, `lib/purchases.ts` (pure helpers), `lib/resume-format.ts`, schemas or templates.

### TypeScript
- No `any`. Use types from types/index.ts.
- ResumeData is the canonical shape everywhere: DB rows, store, template props, PDF route.
- shapeDbRowToResumeData() in lib/utils.ts is the only place DB shape maps to ResumeData.

---

## 12. Launch Checklist

- [ ] Supabase RLS policies enabled and tested for all tables
- [ ] Stripe webhook endpoint registered, secret set in env
- [ ] Safepay webhook registered (when available)
- [ ] `/privacy` and `/terms` pages live (required for payment processor approval)
- [ ] `vercel.json` maxDuration: 60 for the routes that render PDFs (webhook, download-pdf)
- [ ] All env vars set in Vercel dashboard (not just .env.local)
- [ ] Template thumbnails in `/public/templates/`
- [ ] All migrations applied to production (`npx supabase db push`) — includes `payments_stripe_id_unique` and `purchase_owns_resume`
- [ ] `supabase/seed.sql` run against production DB
- [ ] End-to-end test: build → gallery → checkout → PDF → download
- [ ] Test magic link login and returnTo redirect
- [ ] Test re-download gate on production data: free small edit (PDF re-rendered), >10% edit, expired
- [ ] Test buying an edited purchase as a new resume (original reverts)
