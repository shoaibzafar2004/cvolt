import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Download, CreditCard, FileText } from "lucide-react";
import SectionLine from "@/components/shared/SectionLine";

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: FileText,
    title: "Fill in your details",
    desc: "Name, experience, education, skills — guided step by step. No account needed to start.",
  },
  {
    step: "02",
    icon: CreditCard,
    title: "Pick a template",
    desc: "Browse templates with your real data previewed live. See exactly what you get before you pay.",
  },
  {
    step: "03",
    icon: Download,
    title: "Pay once, download",
    desc: "$1.50 one-time. No subscription. Re-download anytime within 30 days.",
  },
];

const FAQ = [
  {
    q: "Can I edit my resume after paying?",
    a: "Yes — sign in to your dashboard with a magic link and edit for free. Re-downloading is free within 30 days if your changes are under 10% of the original content.",
  },
  {
    q: "How long until I can download?",
    a: "Your PDF is generated in about 10–20 seconds after payment and you can download it straight away. It also stays in your dashboard for 30 days.",
  },
  {
    q: "What payment methods are accepted?",
    a: "Credit and debit cards via Stripe, worldwide. Safepay for Pakistan-based users is coming soon.",
  },
  {
    q: "Is there a refund policy?",
    a: "No refunds after the PDF is downloaded. If you have a technical issue, contact us and we'll make it right.",
  },
  {
    q: "Do I need to create an account?",
    a: "Not to build — fill in your details and preview every template without signing up. At checkout you sign in with a magic link (no password), so your purchase is saved to your dashboard.",
  },
];

function DotGrid({
  className,
  size = 20,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <div
      className={className}
      style={{
        backgroundImage:
          "radial-gradient(circle, currentColor 1.8px, transparent 1.8px)",
        backgroundSize: `${size}px ${size}px`,
      }}
    />
  );
}

// Resume card mockup — purely decorative CSS
function ResumeMockup() {
  return (
    <div className="relative flex w-full items-center justify-center">
      {/* Background glow circle */}
      <div className="absolute h-80 w-80 rounded-full bg-indigo-500/10 blur-2xl dark:bg-indigo-400/10" />

      {/* Card stack — back card */}
      <div
        className="absolute w-64 overflow-hidden rounded-2xl border bg-card shadow-lg"
        style={{ transform: "rotate(6deg) translate(24px, 12px)" }}
      >
        <div className="h-10 bg-indigo-200/60 dark:bg-indigo-900/40" />
        <div className="space-y-2 p-4">
          {[60, 90, 75, 50].map((w, i) => (
            <div
              key={i}
              className="h-2 rounded-full bg-muted"
              style={{ width: `${w}%` }}
            />
          ))}
        </div>
      </div>

      {/* Card — main front */}
      <div
        className="relative z-10 w-64 overflow-hidden rounded-2xl border bg-card shadow-2xl"
        style={{ transform: "rotate(-2deg)" }}
      >
        {/* Colored header */}
        <div className="flex h-16 flex-col justify-center gap-1.5 bg-indigo-600 px-5 dark:bg-indigo-700">
          <div className="h-3 w-28 rounded-full bg-white/80" />
          <div className="h-2 w-16 rounded-full bg-white/40" />
        </div>

        {/* Contact row */}
        <div className="flex gap-2 border-b px-5 py-3">
          {[44, 56, 40].map((w, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full bg-muted-foreground/20"
              style={{ width: `${w}px` }}
            />
          ))}
        </div>

        {/* Sections */}
        <div className="space-y-4 p-5">
          {/* Experience block */}
          <div className="space-y-1.5">
            <div className="h-1.5 w-20 rounded-full bg-indigo-500/60" />
            <div className="h-2 w-full rounded-full bg-muted" />
            <div className="h-2 w-4/5 rounded-full bg-muted" />
            <div className="h-2 w-3/4 rounded-full bg-muted" />
          </div>

          {/* Skills block */}
          <div className="space-y-2">
            <div className="h-1.5 w-14 rounded-full bg-indigo-500/60" />
            <div className="flex flex-wrap gap-1.5">
              {[48, 36, 52, 40, 32].map((w, i) => (
                <div
                  key={i}
                  className="h-4 rounded-full bg-indigo-100 dark:bg-indigo-900/40"
                  style={{ width: `${w}px` }}
                />
              ))}
            </div>
          </div>

          {/* Education block */}
          <div className="space-y-1.5">
            <div className="h-1.5 w-18 rounded-full bg-indigo-500/60" />
            <div className="h-2 w-3/5 rounded-full bg-muted" />
            <div className="h-2 w-1/2 rounded-full bg-muted" />
          </div>
        </div>
      </div>

      {/* Stat pills */}
      <div
        className="absolute bottom-2 -left-4 z-20 flex items-center gap-2 rounded-full border bg-card px-4 py-2.5 shadow-lg"
        style={{ transform: "rotate(2deg)" }}
      >
        <span
          className="text-xl font-black"
          style={{ fontFamily: "var(--font-jost)" }}
        >
          $1.50
        </span>
        <span className="text-xs leading-tight text-muted-foreground">
          one-time
          <br />
          payment
        </span>
      </div>

      <div
        className="absolute top-4 -right-4 z-20 flex items-center gap-2 rounded-full border bg-card px-4 py-2.5 shadow-lg"
        style={{ transform: "rotate(-2deg)" }}
      >
        <span
          className="text-xl font-black"
          style={{ fontFamily: "var(--font-jost)" }}
        >
          3+
        </span>
        <span className="text-xs leading-tight text-muted-foreground">
          pro
          <br />
          templates
        </span>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative flex min-h-[92vh] items-center overflow-hidden">
        {/* Subtle gradient backdrop */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-b from-indigo-500/10 via-indigo-500/3 to-transparent dark:from-indigo-400/8 dark:via-indigo-400/3" />

        {/* Left section line */}
        <SectionLine className="top-16 bottom-16 left-6 z-10 xl:left-10" />

        {/* Dot grids */}
        <DotGrid
          className="pointer-events-none absolute top-10 right-0 -z-10 h-64 w-64 text-foreground/8 dark:text-foreground/6"
          size={22}
        />
        <DotGrid
          className="pointer-events-none absolute bottom-0 left-20 -z-10 h-48 w-52 text-foreground/7 dark:text-foreground/5"
          size={22}
        />

        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-6 py-24 lg:grid-cols-2 lg:gap-20 lg:py-16">
          {/* Left — copy */}
          <div>
            {/* Eyebrow */}
            <div className="mb-8 flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium tracking-widest text-muted-foreground uppercase">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-indigo-500" />
                Resume Builder
              </span>
            </div>

            {/* Headline — mixed fill + outline */}
            <h1
              className="mb-8 leading-none tracking-tight"
              style={{
                fontFamily: "var(--font-jost)",
                fontSize: "clamp(3rem, 7vw, 5.5rem)",
                fontWeight: 800,
              }}
            >
              <span className="block text-foreground">One resume.</span>
              <span
                className="block"
                style={{
                  WebkitTextStrokeWidth: "2px",
                  WebkitTextStrokeColor: "var(--foreground)",
                  color: "transparent",
                }}
              >
                One payment.
              </span>
            </h1>

            <p className="mb-10 max-w-md text-lg leading-relaxed text-muted-foreground">
              Build a professional resume, preview it live with your real data,
              pay <span className="font-medium text-foreground">$1.50</span>,
              and download a pixel-perfect PDF instantly.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                className="rounded-full"
                nativeButton={false}
                render={<Link href="/build" />}
              >
                Build free <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full"
                nativeButton={false}
                render={<Link href="/templates" />}
              >
                Browse templates
              </Button>
            </div>
          </div>

          {/* Right — resume mockup */}
          <div className="flex min-h-95 items-center justify-center lg:justify-end">
            <ResumeMockup />
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section className="relative w-full overflow-hidden border-t py-24">
        {/* Section line */}
        <SectionLine className="top-12 right-6 bottom-12 xl:right-10" />
        {/* Dot grid — right side */}
        <DotGrid
          className="pointer-events-none absolute top-0 right-0 h-56 w-56 text-foreground/6 dark:text-foreground/4"
          size={20}
        />
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-16 text-center">
            <p className="mb-3 text-xs font-medium tracking-widest text-muted-foreground uppercase">
              Process
            </p>
            <h2
              className="text-4xl font-bold"
              style={{ fontFamily: "var(--font-jost)" }}
            >
              Three steps to done
            </h2>
          </div>

          <div className="relative grid grid-cols-1 gap-8 sm:grid-cols-3">
            {/* Connector line (desktop) */}
            <div className="absolute top-7 right-[calc(16.666%+1rem)] left-[calc(16.666%+1rem)] hidden h-px bg-border sm:block" />

            {HOW_IT_WORKS.map(({ step, icon: Icon, title, desc }) => (
              <div
                key={step}
                className="flex flex-col items-center gap-4 text-center"
              >
                <div className="relative flex flex-col items-center">
                  <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border-2 border-indigo-500/40 bg-indigo-500/8 dark:bg-indigo-500/10">
                    <Icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <span
                    className="absolute -top-3 -right-3 text-xs font-black text-indigo-500/50"
                    style={{ fontFamily: "var(--font-jost)" }}
                  >
                    {step}
                  </span>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">{title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────── */}
      <section className="relative w-full overflow-hidden border-t bg-muted/40 py-24">
        {/* Section line */}
        <SectionLine className="top-12 bottom-12 left-6 xl:left-10" />
        {/* Dot grid — bottom left */}
        <DotGrid
          className="pointer-events-none absolute bottom-0 left-20 h-48 w-48 text-foreground/7 dark:text-foreground/4"
          size={20}
        />

        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-16 text-center">
            <p className="mb-3 text-xs font-medium tracking-widest text-muted-foreground uppercase">
              Pricing
            </p>
            <h2
              className="text-4xl font-bold"
              style={{ fontFamily: "var(--font-jost)" }}
            >
              <span className="text-indigo-500">Price</span> Board
            </h2>
          </div>

          <div className="mx-auto grid max-w-2xl grid-cols-1 items-start gap-6 sm:grid-cols-2">
            {/* Competitors — plain card */}
            <div className="relative flex flex-col gap-6 overflow-hidden rounded-2xl border bg-card p-8">
              {/* Dot grid bottom-right */}
              <div
                className="pointer-events-none absolute right-3 bottom-3 h-20 w-20 text-muted-foreground/20"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, currentColor 1.5px, transparent 1.5px)",
                  backgroundSize: "12px 12px",
                }}
              />
              <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                Typical Builders
              </p>
              <div className="flex items-baseline gap-1">
                <span
                  className="text-5xl leading-none font-black"
                  style={{ fontFamily: "var(--font-jost)" }}
                >
                  10–25
                </span>
                <span
                  className="text-3xl font-bold text-indigo-500"
                  style={{ fontFamily: "var(--font-jost)" }}
                >
                  $
                </span>
                <span className="ml-1 text-sm text-muted-foreground">
                  / Month
                </span>
              </div>
              <p className="-mt-2 text-sm text-muted-foreground">
                Locked behind a subscription. Pay every month just to keep
                access.
              </p>
              <ul className="flex-1 space-y-3 text-sm">
                {["PDF download", "Template access"].map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-3 text-foreground"
                  >
                    <span className="text-base leading-none font-bold text-indigo-500">
                      ✓
                    </span>{" "}
                    {f}
                  </li>
                ))}
                {[
                  "No subscription",
                  "Build without an account",
                  "Instant re-download",
                ].map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-3 text-muted-foreground/60 line-through"
                  >
                    <span className="text-base leading-none font-bold text-muted-foreground/40">
                      ✓
                    </span>{" "}
                    {f}
                  </li>
                ))}
              </ul>
              <button
                disabled
                className="h-12 w-full cursor-not-allowed rounded-full border-2 border-muted-foreground/20 text-sm font-semibold tracking-wide text-muted-foreground"
                style={{ fontFamily: "var(--font-jost)" }}
              >
                NOT RECOMMENDED
              </button>
            </div>

            {/* Cvolt — featured card, slightly elevated */}
            <div className="relative flex flex-col gap-6 overflow-hidden rounded-2xl border-2 border-foreground bg-card p-8 shadow-xl">
              {/* Dot grid bottom-right */}
              <div
                className="pointer-events-none absolute right-3 bottom-3 h-20 w-20 text-foreground/10"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, currentColor 1.5px, transparent 1.5px)",
                  backgroundSize: "12px 12px",
                }}
              />
              <p className="pt-2 text-xs font-semibold tracking-widest text-foreground uppercase">
                Cvolt
              </p>
              <div className="flex items-baseline gap-1">
                <span
                  className="text-5xl leading-none font-black"
                  style={{ fontFamily: "var(--font-jost)" }}
                >
                  1.50
                </span>
                <span
                  className="text-3xl font-bold text-indigo-500"
                  style={{ fontFamily: "var(--font-jost)" }}
                >
                  $
                </span>
                <span className="ml-1 text-sm text-muted-foreground">
                  One-time
                </span>
              </div>
              <p className="-mt-2 text-sm text-muted-foreground">
                Pay once, download instantly. Re-download for 30 days. No
                strings attached.
              </p>
              <ul className="flex-1 space-y-3 text-sm">
                {[
                  "PDF download",
                  "All templates included",
                  "No subscription",
                  "Build without an account",
                  "30-day re-download",
                ].map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-3 text-foreground"
                  >
                    <span className="text-base leading-none font-bold text-indigo-500">
                      ✓
                    </span>{" "}
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                className="h-12 w-full rounded-full text-sm font-semibold tracking-wide"
                style={{ fontFamily: "var(--font-jost)" }}
                nativeButton={false}
                render={<Link href="/build" />}
              >
                GET STARTED →
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section className="relative w-full overflow-hidden border-t py-24">
        <SectionLine className="top-12 right-6 bottom-12 xl:right-10" />
        <DotGrid
          className="pointer-events-none absolute top-0 right-0 h-44 w-44 text-foreground/6 dark:text-foreground/4"
          size={20}
        />
        <div className="mx-auto max-w-2xl px-6">
          <div className="mb-14 text-center">
            <p className="mb-3 text-xs font-medium tracking-widest text-muted-foreground uppercase">
              FAQ
            </p>
            <h2
              className="text-4xl font-bold"
              style={{ fontFamily: "var(--font-jost)" }}
            >
              Questions answered
            </h2>
          </div>

          <div className="divide-y">
            {FAQ.map(({ q, a }) => (
              <div key={q} className="py-6">
                <h3 className="mb-2 text-[15px] font-semibold">{q}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ───────────────────────────────────────── */}
      <section className="relative w-full overflow-hidden border-t bg-muted/40">
        <SectionLine className="top-10 bottom-10 left-6 xl:left-10" />

        <DotGrid
          className="pointer-events-none absolute right-0 bottom-0 h-52 w-52 text-foreground/6 dark:text-foreground/4"
          size={20}
        />
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <p className="mb-4 text-xs font-medium tracking-widest text-muted-foreground uppercase">
            Get started
          </p>
          <h2
            className="mb-4 text-4xl leading-tight font-bold sm:text-5xl"
            style={{ fontFamily: "var(--font-jost)" }}
          >
            Your resume,
            <br />
            <span
              style={{
                WebkitTextStrokeWidth: "1.5px",
                WebkitTextStrokeColor: "var(--foreground)",
                color: "transparent",
              }}
            >
              ready in minutes.
            </span>
          </h2>
          <p className="mb-10 text-muted-foreground">
            Free to fill in. Pay only when you&apos;re ready to download.
          </p>
          <Button
            size="lg"
            className="rounded-full"
            nativeButton={false}
            render={<Link href="/build" />}
          >
            Start building — it&apos;s free <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>
    </div>
  );
}
