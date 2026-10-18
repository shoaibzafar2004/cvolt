# Cvolt — Complete Project Summary & Claude Code Plan

---

## 1. What We're Building

**Cvolt** is a one-time-pay resume builder web app. The core differentiator is no subscription — users fill in their details, browse templates Netflix-style with their real data previewed live, pay once (~$1.50–$3), and download a PDF.

**Target users:** Fresh graduates, job switchers, and people in developing markets who need one good resume without a monthly commitment.

**Business model:** Single payment per resume download. No accounts required to build — auth only needed to access purchased downloads later.

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
| Payments (Pakistan) | Safepay | Local payment coverage for developing market users |

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
| personal_info | jsonb | name, email, phone, location, LinkedIn, website |
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
│   │   ├── page.tsx
│   │   ├── edit/[id]/                  # page.tsx (server) → EditFormShell.tsx (client)
│   │   └── download/[id]/page.tsx      # Re-download gate
│   ├── api/
│   │   ├── generate-pdf/route.ts
│   │   ├── download-pdf/[paymentId]/route.ts
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
│   ├── build/                          # StepWrapper, Step1–4, WorkBlock, BulletEditor (Tiptap), PhotoCropModal
│   ├── templates/                      # TemplateCard, FilterBar, ThemePicker
│   ├── resume-templates/               # THE CRITICAL FOLDER — one *Template.tsx per design (14),
│   │                                   #   plus ClientOnlyTemplate.tsx (client-only render wrapper)
│   ├── ui/                             # shadcn components (badge, button, dialog, input, select,
│   │                                   #   sheet, skeleton, textarea) + custom month-picker
│   └── shared/                         # Navbar, Footer, AuthGate, LogoutButton, SectionLine,
│                                       #   ThemeProvider, ThemeToggle
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                   # Browser client
│   │   └── server.ts                   # RSC + API routes
│   ├── pdf.ts                          # Puppeteer + chromium
│   ├── schemas.ts                      # All Zod schemas
│   ├── payments.ts                     # Stripe + Safepay helpers
│   ├── templates.ts                    # Registry: slug → component, plus per-template themes
│   ├── cropImage.ts                    # Canvas helper for the photo cropper
│   └── utils.ts                        # cn(), daysUntil(), shapeDbRowToResumeData
│
├── store/
│   ├── resumeStore.ts                  # personalInfo, sections[], resumeId, mode, isDirty
│   └── uiStore.ts                      # currentStep, activeFilter, loading
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
| `/build` | Multi-step form router. Auto-saves to localStorage on blur, syncs to Supabase on step complete |
| `/build?step=1` | Personal info — name, job title, email, phone, location, LinkedIn, website |
| `/build?step=2` | Work experience — repeatable blocks, rich text bullet points, add/remove/reorder |
| `/build?step=3` | Education + skills + optional extras (certifications, languages, projects). Toggle sections on/off |
| `/build?step=4` | Professional summary (optional/skippable) + mini preview of completed resume |
| `/templates` | Gallery — CSS grid, live previews at ~30% zoom with real user data, filter bar |
| `/templates/[slug]` | Full-size preview — left: rendered resume, right: template info + "Use this — $1.50" CTA |

### Payment flow

| Route | Description |
|---|---|
| `/checkout` | Order summary, email input, Stripe or Safepay selector, submit |
| `/checkout/processing` | Spinner while payment confirms and PDF generates. Auto-redirects to /success |
| `/success` | Download button + "Check your email" message + 30-day countdown |
| `/checkout/failed` | Error reason shown. "Try again" preserves form state |

### Authenticated (requires login)

| Route | Description |
|---|---|
| `/dashboard` | Purchased resumes. Each card shows template thumbnail, purchase date, days left, Edit + Download buttons |
| `/dashboard/edit/[id]` | Same multi-step form as /build but pre-filled. Hydrates Zustand from Supabase on mount |
| `/dashboard/download/[id]` | Gate: within 30 days + diff under 10%? Serve PDF. Expired? → /checkout. High diff? → /checkout |
| `/login` | Magic link only. Email input → "Check your inbox" → redirect to /dashboard |

### Static / utility

| Route | Description |
|---|---|
| `/privacy` | Required for Stripe + Safepay approval |
| `/terms` | No refunds after PDF download |
| `/404` | Not found, link back home |

---

## 6. Build Form Flow

4 steps, single direction, progress bar with 4 pills.

**State architecture:**
- `useResumeStore` (Zustand) holds: `personalInfo`, `sections[]`, `currentStep`, `resumeId`, `mode` ('create' | 'edit'), `isDirty`, `lastSaved`
- Each step mounts its own `useForm()` with a Zod schema passed as `zodResolver`
- On Next: RHF `handleSubmit` validates → merges into Zustand → step + 1
- On Back: no validation, data already in Zustand

**Persistence:**
- localStorage (`cvolt_draft`) writes on every field blur
- Supabase upsert on step completion (requires auth or anon key)
- On sign-in: merge anon draft into user account

**Validation:**
- Steps 1–3: validate on Next
- Step 4: always skippable
- Schemas: `personalInfoSchema`, `workEntrySchema`, `educationSchema`, `skillsSchema` — all in `lib/schemas.ts`

**After step 4:** Push to `/templates`. Resume data passed via Zustand store.

**Edit mode (`/dashboard/edit/[id]`):**
The page is a React Server Component. It fetches the resume server-side, checks auth, and if valid passes the data to a client shell component. The shell runs `useEffect` to call `store.hydrate(data, id)` — skipping the fetch entirely if `store.resumeId === params.id`. Each step's `defaultValues` reads from the store, which is already populated before `useForm` initializes.

---

## 7. Template Gallery Architecture

**Data sources on `/templates` mount:**
- `resumeData` from Zustand store (user's filled-in data)
- `templates[]` from Supabase (static, cached)
- `payments[]` from Supabase (auth user only — determines CTA state)

**Template card grid:** CSS grid, 2–3 cols by viewport. Each card contains:
- Live preview div: `<TemplateComponent>` at full A4 size, CSS `scale()` to ~30%, `pointer-events: none`
- Template name + price
- CTA button (3 states: "Use this — $1.50", "Already purchased", "Re-download")

**Template component contract:**
- Pure React component, props: `ResumeData`, no external fetch
- Same component used by gallery, detail page, AND PDF API route
- Inline styles + CSS vars only. No Tailwind. No exceptions.
- Fonts via `@font-face` inside each template

---

## 8. PDF Generation

API route: `POST /api/generate-pdf`

```
1. Receive { resumeId, templateId, paymentId }
2. Verify payment is completed in DB
3. Load resume snapshot data
4. Look up component from lib/templates.ts registry
5. ReactDOMServer.renderToStaticMarkup(<Template data={data} />)
6. Wrap in full HTML document with @font-face styles in <head>
7. Launch @sparticuz/chromium + Puppeteer
8. page.setContent(html) → page.pdf({ format: 'A4', printBackground: true })
9. Upload PDF buffer to Supabase Storage
10. Return signed download URL
```

---

## 9. Payment Flow

**Checkout → PDF → download:**
1. User submits checkout form
2. Payment intent created server-side
3. Stripe/Safepay webhook fires on success
4. Webhook: create payment record → freeze resume snapshot → generate PDF → upload to storage → send magic link
5. Processing page polls status → redirects to /success
6. /success shows download button + 30-day countdown

**Re-download gate (`/dashboard/download/[id]`):**
- Check 1: within 30 days of purchase?
- Check 2: resume diff under 10% from snapshot char count?
- Both pass → serve PDF. Either fails → redirect to /checkout.

---

## 10. Auth Flow

Magic link only. Anonymous users can build + pay without an account. Email at checkout doubles as auth trigger. Draft merges into account on sign-in. `AuthGate` server component wraps all `/dashboard/*` routes.

---

## 11. Claude Code Plan

Work through these phases in order. Each phase ends in a working, testable state.

> This is the original build plan. Where it differs from the code, the code wins — e.g. the schema lives in `supabase/migrations/` (not `supabase/schema.sql`), there are 14 templates, and `hooks/useAuth.ts` / `useResumeDraft.ts` were never needed.

---

### Phase 1 — Project scaffold

**Prompt 1 — Init:**
```
Create a new Next.js 14 app called "cvolt" with TypeScript, Tailwind CSS, and App Router.
Install: zustand, react-hook-form, @hookform/resolvers, zod, @supabase/supabase-js,
@supabase/ssr, shadcn/ui. Initialize shadcn with default config.
Add Button, Input, Progress, Badge, Separator components from shadcn.
```

**Prompt 2 — Folder structure:**
```
Create the full folder structure for Cvolt. Create empty stub files in each:
- app/(all routes: build, templates, checkout, dashboard, api, login, privacy, terms)
- components/build/, components/templates/, components/resume-templates/,
  components/ui/, components/shared/
- lib/supabase/, lib/
- store/, types/, hooks/
```

**Prompt 3 — Types:**
```
Create types/index.ts with TypeScript interfaces:
- ResumeData { personalInfo: PersonalInfo, sections: Section[] }
- PersonalInfo { name, jobTitle, email, phone, location, linkedIn?, website? }
- Section { id, type: SectionType, content: any, displayOrder: number }
- WorkContent { company, role, startDate, endDate?, current: boolean, bullets: string[] }
- EducationContent { institution, degree, field, startDate, endDate?, gpa? }
- SkillsContent { skills: string[] }
- Template { id, name, slug, thumbnailUrl, isActive }
- Payment { id, userId, templateId, status, purchasedAt, expiresAt }
- SectionType = 'work' | 'education' | 'skills' | 'certifications' | 'languages' | 'projects'
```

**Prompt 4 — Zustand stores:**
```
Create store/resumeStore.ts with Zustand. State:
  resumeId: string | null, mode: 'create' | 'edit',
  personalInfo: PersonalInfo (empty defaults), sections: Section[],
  isDirty: boolean, lastSaved: Date | null

Actions: setPersonalInfo, upsertSection, removeSection, reorderSections,
  hydrate(data: ResumeData, id: string), reset(), markSaved()

Create store/uiStore.ts:
  currentStep: number (1–4), activeFilter: 'all'|'clean'|'modern'|'creative',
  isLoading: boolean
  Actions: setStep, setFilter, setLoading
```

**Prompt 5 — Supabase:**
```
Create lib/supabase/client.ts (browser client via @supabase/ssr createBrowserClient)
and lib/supabase/server.ts (server client via createServerClient with cookies()).
Use NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY env vars.

Create supabase/schema.sql with all 6 tables: users, resumes, resume_sections,
templates, payments, resume_snapshots. Include RLS policies: users can only
read/write their own data. Templates are publicly readable.
```

---

### Phase 2 — Build form (Steps 1–4)

**Prompt 6 — Zod schemas:**
```
Create lib/schemas.ts with Zod schemas:
- personalInfoSchema: name required, email valid, other fields as typed
- workEntrySchema: company + role required, bullets: z.array(z.string())
- educationSchema: institution + degree required
- skillsSchema: z.array(z.string()).min(1)
- summarySchema: z.string().max(500).optional()
Export inferred TypeScript types from each schema.
```

**Prompt 7 — StepWrapper + progress bar:**
```
Create components/build/StepWrapper.tsx:
- Read currentStep from uiStore
- Progress bar: 4 pills (active = filled purple, complete = checkmark, future = muted)
- Render Step1/Step2/Step3/Step4 based on currentStep
- Back button (hidden on step 1): decrement step, no validation
- Next button: triggers current step form submit via forwarded ref

Create app/build/page.tsx rendering StepWrapper.
```

**Prompt 8 — Step 1 (personal info):**
```
Create components/build/Step1.tsx:
- useForm with zodResolver(personalInfoSchema)
- defaultValues from resumeStore.personalInfo
- Fields: Full name, Job title, Email, Phone, Location, LinkedIn (optional), Website (optional)
- On valid submit: store.setPersonalInfo(data), uiStore.setStep(2)
- On every field blur: write store to localStorage key 'cvolt_draft'
- If authenticated: upsert to Supabase resumes table
- Show inline validation errors
```

**Prompt 9 — Step 2 (work experience):**
```
Create components/build/Step2.tsx and WorkBlock.tsx:
- useFieldArray for work entries
- WorkBlock fields: Company, Role, Start date, End date (disabled if current=true),
  bullet points textarea, delete button
- "Add experience" appends empty entry
- Drag-to-reorder with @dnd-kit/sortable
- On submit: upsert sections (type='work'), advance to step 3
```

**Prompt 10 — Step 3 (education + skills):**
```
Create components/build/Step3.tsx:
- Education: repeatable blocks (institution, degree, field, dates)
- Skills: tag-style input
- Toggle switches for optional sections: Certifications, Languages, Projects
- Each toggled section has simple repeatable fields
- On submit: upsert all sections, advance to step 4
```

**Prompt 11 — Step 4 (summary + preview):**
```
Create components/build/Step4.tsx:
- Optional textarea for professional summary (max 500 chars with counter)
- "Skip" button advances without saving
- Mini preview: render CleanTemplate at ~40% scale with current store data
- "Browse templates →" navigates to /templates
```

---

### Phase 3 — Template system

**Prompt 12 — First template component:**
```
Create components/resume-templates/CleanTemplate.tsx.
Props: { data: ResumeData }
CRITICAL RULES (non-negotiable):
- Inline styles ONLY. No Tailwind. No CSS modules. No styled-components.
- Fonts embedded via @font-face in a <style> JSX tag inside the component
- A4 dimensions: width 794px, height 1123px
- Clean single-column layout: name/title header, then sections by displayOrder
- Render all section types: work, education, skills, projects, certifications, languages
- Skip sections with empty content
- Must render identically via ReactDOMServer.renderToStaticMarkup() and in browser
```

**Prompt 13 — Template registry:**
```
Create lib/templates.ts:
- Registry: Record<string, React.ComponentType<{ data: ResumeData }>>
- Initial entry: { 'clean': CleanTemplate }
- getTemplate(slug: string): component or throw
- getAllTemplates(): Array<{ slug, component }>
```

**Prompt 14 — Template gallery:**
```
Create app/templates/page.tsx (server component: fetches templates[] from Supabase)
and components/templates/TemplateCard.tsx.

TemplateCard live preview:
- Render <TemplateComponent data={resumeData} /> at full A4 size
- Wrap in container: overflow:hidden, fixed card dimensions
- Apply CSS transform: scale(0.3) transform-origin: top left to the inner div
- pointer-events: none on the preview div

CTA button states from payments[]:
1. Not purchased: "Use this — $1.50" → /checkout?templateId=X&resumeId=Y
2. Purchased + active: "Re-download" → /dashboard/download/[paymentId]
3. Purchased + expired: "Use this — $1.50" → /checkout

FilterBar: pill buttons filtering by template.category client-side, no refetch.
```

**Prompt 15 — Template detail page:**
```
Create app/templates/[slug]/page.tsx:
- Left panel (60%): full A4 rendered resume, CSS scale to fit viewport height
- Right panel (40%): name, category badge, price "$1.50", "Use this template" → /checkout
- If store is empty (direct URL): render template with placeholder/sample data
```

---

### Phase 4 — Payment flow

**Prompt 16 — Checkout page:**
```
Create app/checkout/page.tsx:
- Read templateId + resumeId from URL params
- Order summary: template thumbnail, name, price $1.50
- Email input (required)
- Payment method tabs: Stripe card (Stripe Elements) / Safepay
- Submit: "Pay $1.50 and download"
- On submit: POST to create payment intent, handle redirect
```

**Prompt 17 — Stripe webhook:**
```
Create lib/payments.ts: createStripePaymentIntent() server-side helper.

Create app/api/webhook/stripe/route.ts:
- Verify Stripe-Signature header
- On payment_intent.succeeded:
  1. Create payment record (status='completed')
  2. Create resume_snapshot (freeze current resume data + char_count)
  3. Call generatePdf() from lib/pdf.ts
  4. Upload PDF to Supabase Storage: resumes/{userId}/{paymentId}.pdf
  5. Update payment with snapshot_id
  6. supabase.auth.signInWithOtp({ email }) to send magic link
```

**Prompt 18 — PDF API route:**
```
Create app/api/generate-pdf/route.ts:
POST { resumeId, templateId, paymentId }
1. Verify payment exists and status = 'completed'
2. Fetch resume + sections from DB, shape to ResumeData
3. Import component from lib/templates.ts
4. html = ReactDOMServer.renderToStaticMarkup(<Template data={data} />)
5. Wrap in full HTML doc with <head> containing font @font-face declarations
6. Launch Puppeteer with @sparticuz/chromium
7. page.setContent(html, { waitUntil: 'networkidle0' })
8. buffer = await page.pdf({ format: 'A4', printBackground: true })
9. Upload to Supabase Storage, return signed URL

Create lib/pdf.ts with @sparticuz/chromium Puppeteer launch config for Vercel.
```

**Prompt 19 — Processing + success pages:**
```
Create app/checkout/processing/page.tsx:
- Poll GET /api/payment-status?paymentId=X every 2 seconds
- Show spinner + "Preparing your resume..."
- On status=completed: redirect to /success?paymentId=X

Create app/success/page.tsx:
- Large "Download resume" button → /dashboard/download/[paymentId]
- "Check your email for a download link"
- 30-day expiry countdown
- Share prompt
```

---

### Phase 5 — Dashboard + edit flow

**Prompt 20 — AuthGate:**
```
Create components/shared/AuthGate.tsx (server component):
- Check Supabase session
- No session: redirect('/login?returnTo=' + currentPath)
- Session: render children

Wrap app/dashboard/layout.tsx with AuthGate.
```

**Prompt 21 — Login + auth callback:**
```
Create app/login/page.tsx:
- Email input + "Send magic link" button
- supabase.auth.signInWithOtp({ email })
- Show "Check your inbox" on submit
- Store returnTo from URL params in sessionStorage

Create app/auth/callback/route.ts:
- Exchange code for session via supabase.auth.exchangeCodeForSession()
- Redirect to returnTo (from sessionStorage) or /dashboard
```

**Prompt 22 — Dashboard:**
```
Create app/dashboard/page.tsx (server component):
- Fetch payments joined with templates and resumes for current user
- Render resume card grid
- Each card: template thumbnail, resume title, purchase date,
  days remaining (or "Expired" badge), Edit button, Download button
```

**Prompt 23 — Edit flow:**
```
Create app/dashboard/edit/[id]/page.tsx (server component):
- Verify auth, fetch resume+sections WHERE id=params.id AND user_id=session.user.id
- Not found → redirect('/dashboard')
- Pass data to <EditFormShell resume={data} />

Create components/build/EditFormShell.tsx ('use client'):
- useEffect: if store.resumeId !== resume.id, call store.hydrate(shaped, resume.id)
- Render <BuildForm /> (same StepWrapper as /build)
- Show diff indicator if isDirty

Add lib/utils.ts shapeDbRowToResumeData():
- Maps { personal_info: jsonb, resume_sections: [] } → ResumeData
- Sorts sections by display_order
```

**Prompt 24 — Download gate:**
```
Create app/dashboard/download/[id]/page.tsx:
- Fetch payment by id, verify user_id matches session
- Check 1: now < expires_at? If not → redirect('/checkout')
- Check 2: fetch current resume char_count vs snapshot.char_count
  diff = abs(current - snapshot) / snapshot
  if diff > 0.10 → redirect('/checkout')
- Both pass: fetch signed URL from Supabase Storage
- Render download button or trigger auto-download
```

---

### Phase 6 — Polish + production readiness

**Prompt 25 — Landing page:**
```
Create app/page.tsx — the Cvolt landing page.
Sections:
1. Hero: "One resume. One payment." headline + "Build free →" CTA
2. How it works: 3 steps with icons (Fill details / Pick template / Pay & download)
3. Live template previews: 3 TemplateCards with sample data
4. Pricing: "$1.50 one-time" card vs competitor table (typical $10–25/month)
5. FAQ: 5 entries (Can I edit after paying? How long to download? etc.)
6. Footer: Privacy, Terms, GitHub link
```

**Prompt 26 — Two more templates:**
```
Create components/resume-templates/ModernTemplate.tsx:
Two-column layout. Left sidebar (30%): contact info, skills, colored background.
Right column (70%): work experience, education. Same inline-styles-only rule.

Create components/resume-templates/CreativeTemplate.tsx:
Bold accent-color header, horizontal rule section dividers, slightly more typographic.
Same inline-styles-only rule.

Register both in lib/templates.ts. Add seed records to supabase/seed.sql.
```

**Prompt 27 — Error handling:**
```
Add error handling to:
- /build: if Supabase write fails, keep in localStorage, show toast "Saved locally"
- /checkout: if payment fails, preserve form, show reason from Stripe error code
- /api/generate-pdf: if Puppeteer throws, set payment status='failed',
  show retry button on /checkout/failed

Add loading skeletons to:
- Template gallery while fetching from Supabase
- Dashboard resume cards
- /checkout/processing
```

**Prompt 28 — Vercel + env config:**
```
Create vercel.json:
{
  "functions": {
    "app/api/generate-pdf/route.ts": { "maxDuration": 60 },
    "app/api/webhook/stripe/route.ts": { "maxDuration": 10 }
  }
}

Create .env.example:
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
SAFEPAY_SECRET_KEY=
NEXT_PUBLIC_APP_URL=

Create supabase/seed.sql with 3 template records (clean, modern, creative)
and a test payment record for local dev.
```

---

## 12. CLAUDE.md — Paste This in the Project Root

Create a file called `CLAUDE.md` at the root of the repo. Claude Code reads this automatically on every session.

```markdown
# Cvolt — Rules for Claude Code

## Template components (components/resume-templates/)
- Inline styles ONLY. Never import or use Tailwind classes.
- No hooks, no browser APIs, no external fetches.
- Must render identically in browser AND via ReactDOMServer.renderToStaticMarkup().
- A4 size: width 794px, height 1123px.
- Fonts via @font-face in a <style> JSX tag inside the component, not via next/font or link.

## Supabase
- Development uses local Supabase (`npm run db:start`); there is no hosted dev project.
- Schema changes go in a NEW file via `npx supabase migration new <name>`. Never edit an applied migration.
- `npm run db:reset` wipes local data and re-applies migrations + seed.
- Use lib/supabase/client.ts in 'use client' components only.
- Use lib/supabase/server.ts in server components and API route handlers.
- Never import the browser client in a server context — it will throw.

## Zustand
- resumeStore owns all resume data (personalInfo, sections, resumeId, mode, isDirty).
- uiStore owns all ephemeral UI state (currentStep, activeFilter, isLoading).
- Never put UI state in resumeStore or data state in uiStore.

## Forms
- Each /build step gets its own useForm() instance, scoped to that step only.
- Always pass zodResolver(stepSchema) to useForm({ resolver }).
- defaultValues always come from the Zustand store — never from local useState.

## Payments
- Never trust client-side payment confirmation.
- Mark payments complete ONLY inside the webhook handler after signature verification.
- The webhook creates the snapshot, triggers PDF generation, and sends the magic link.

## React / lint
- `npm run lint` must report zero errors.
- Client-only rendering: use `useMounted()` from hooks/useMounted.ts — never `useState` + `useEffect(() => setMounted(true))`.
- No impure calls (`Date.now()`, `Math.random()`) directly in a component body; put them in a helper (e.g. `daysUntil()` in lib/utils.ts).
- Look up template components from `registry` in lib/templates.ts; don't hand-write slug → component switches.

## Git & formatting
- Never commit to `main` or `develop` directly. Branch off `develop` (`feat/`, `fix/`, `chore/`), PR into `develop`. Only `develop` → `main` PRs update main.
- Code is formatted by Prettier (no semicolons, single quotes, width 100). Run `npm run format` before committing; CI fails on `format:check`, `lint`, `typecheck` or `build`.

## TypeScript
- No `any`. Use types from types/index.ts.
- ResumeData is the canonical shape everywhere: DB rows, store, template props, PDF route.
- shapeDbRowToResumeData() in lib/utils.ts is the only place DB shape maps to ResumeData.
```

---

## 13. Launch Checklist

- [ ] Supabase RLS policies enabled and tested for all tables
- [ ] Stripe webhook endpoint registered, secret set in env
- [ ] Safepay webhook registered (when available)
- [ ] `/privacy` and `/terms` pages live (required for payment processor approval)
- [ ] `vercel.json` maxDuration: 60 set for PDF route
- [ ] All env vars set in Vercel dashboard (not just .env.local)
- [ ] Template thumbnails in `/public/templates/`
- [ ] `supabase/seed.sql` run against production DB
- [ ] End-to-end test: build → gallery → checkout → PDF → download
- [ ] Test magic link login and returnTo redirect
- [ ] Test re-download gate: within 30 days, expired, and high-diff cases
- [ ] Test edit flow: verify diff indicator and snapshot comparison
