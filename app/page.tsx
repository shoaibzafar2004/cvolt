import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Download, CreditCard, FileText } from 'lucide-react'
import SectionLine from '@/components/shared/SectionLine'

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: FileText,
    title: 'Fill in your details',
    desc: 'Name, experience, education, skills — guided step by step. No account needed to start.',
  },
  {
    step: '02',
    icon: CreditCard,
    title: 'Pick a template',
    desc: 'Browse templates with your real data previewed live. See exactly what you get before you pay.',
  },
  {
    step: '03',
    icon: Download,
    title: 'Pay once, download',
    desc: '$1.50 one-time. No subscription. Re-download anytime within 30 days.',
  },
]

const FAQ = [
  { q: 'Can I edit my resume after paying?', a: 'Yes — sign in with the magic link we email you, go to your dashboard, and edit for free. Re-download is available if your changes are under 10% of the original content.' },
  { q: 'How long until I can download?', a: 'Your PDF is generated in about 10–20 seconds after payment. A download link is also emailed to you.' },
  { q: 'What payment methods are accepted?', a: 'Credit and debit cards via Stripe globally. Safepay for Pakistan-based users.' },
  { q: 'Is there a refund policy?', a: "No refunds after the PDF is downloaded. If you have a technical issue, contact us and we'll make it right." },
  { q: 'Do I need to create an account?', a: 'No — build and pay without signing up. We email you a magic link after purchase so you can re-download later.' },
]

function DotGrid({ className, size = 20 }: { className?: string; size?: number }) {
  return (
    <div
      className={className}
      style={{
        backgroundImage: 'radial-gradient(circle, currentColor 1.8px, transparent 1.8px)',
        backgroundSize: `${size}px ${size}px`,
      }}
    />
  )
}


// Resume card mockup — purely decorative CSS
function ResumeMockup() {
  return (
    <div className="relative w-full flex items-center justify-center">
      {/* Background glow circle */}
      <div className="absolute w-80 h-80 rounded-full bg-indigo-500/10 dark:bg-indigo-400/10 blur-2xl" />

      {/* Card stack — back card */}
      <div
        className="absolute w-64 bg-card border shadow-lg rounded-2xl overflow-hidden"
        style={{ transform: 'rotate(6deg) translate(24px, 12px)' }}
      >
        <div className="h-10 bg-indigo-200/60 dark:bg-indigo-900/40" />
        <div className="p-4 space-y-2">
          {[60, 90, 75, 50].map((w, i) => (
            <div key={i} className="h-2 rounded-full bg-muted" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>

      {/* Card — main front */}
      <div
        className="relative w-64 bg-card border shadow-2xl rounded-2xl overflow-hidden z-10"
        style={{ transform: 'rotate(-2deg)' }}
      >
        {/* Colored header */}
        <div className="h-16 bg-indigo-600 dark:bg-indigo-700 px-5 flex flex-col justify-center gap-1.5">
          <div className="h-3 w-28 rounded-full bg-white/80" />
          <div className="h-2 w-16 rounded-full bg-white/40" />
        </div>

        {/* Contact row */}
        <div className="flex gap-2 px-5 py-3 border-b">
          {[44, 56, 40].map((w, i) => (
            <div key={i} className="h-1.5 rounded-full bg-muted-foreground/20" style={{ width: `${w}px` }} />
          ))}
        </div>

        {/* Sections */}
        <div className="p-5 space-y-4">
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
                <div key={i} className="h-4 rounded-full bg-indigo-100 dark:bg-indigo-900/40" style={{ width: `${w}px` }} />
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
        className="absolute bottom-2 -left-4 flex items-center gap-2 bg-card border shadow-lg rounded-full px-4 py-2.5 z-20"
        style={{ transform: 'rotate(2deg)' }}
      >
        <span className="text-xl font-black" style={{ fontFamily: 'var(--font-jost)' }}>$1.50</span>
        <span className="text-xs text-muted-foreground leading-tight">one-time<br />payment</span>
      </div>

      <div
        className="absolute top-4 -right-4 flex items-center gap-2 bg-card border shadow-lg rounded-full px-4 py-2.5 z-20"
        style={{ transform: 'rotate(-2deg)' }}
      >
        <span className="text-xl font-black" style={{ fontFamily: 'var(--font-jost)' }}>3+</span>
        <span className="text-xs text-muted-foreground leading-tight">pro<br />templates</span>
      </div>
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="flex flex-col">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        {/* Subtle gradient backdrop */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-b from-indigo-500/10 via-indigo-500/3 to-transparent dark:from-indigo-400/8 dark:via-indigo-400/3" />

        {/* Left section line */}
        <SectionLine className="left-6 xl:left-10 top-16 bottom-16 z-10" />

        {/* Dot grids */}
        <DotGrid className="pointer-events-none absolute top-10 right-0 w-64 h-64 text-foreground/8 dark:text-foreground/6 -z-10" size={22} />
        <DotGrid className="pointer-events-none absolute bottom-0 left-20 w-52 h-48 text-foreground/7 dark:text-foreground/5 -z-10" size={22} />

        <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center py-24 lg:py-16">

          {/* Left — copy */}
          <div>
            {/* Eyebrow */}
            <div className="flex items-center gap-2.5 mb-8">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium tracking-widest uppercase text-muted-foreground border rounded-full px-3 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block" />
                Resume Builder
              </span>
            </div>

            {/* Headline — mixed fill + outline */}
            <h1
              className="leading-none tracking-tight mb-8"
              style={{ fontFamily: 'var(--font-jost)', fontSize: 'clamp(3rem, 7vw, 5.5rem)', fontWeight: 800 }}
            >
              <span className="block text-foreground">One resume.</span>
              <span
                className="block"
                style={{ WebkitTextStrokeWidth: '2px', WebkitTextStrokeColor: 'var(--foreground)', color: 'transparent' }}
              >
                One payment.
              </span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-md mb-10 leading-relaxed">
              Build a professional resume, preview it live with your real data, pay{' '}
              <span className="text-foreground font-medium">$1.50</span>, and download a
              pixel-perfect PDF instantly.
            </p>

            <div className="flex gap-3 flex-wrap">
              <Button size="lg" className="rounded-full" nativeButton={false} render={<Link href="/build" />}>
                Build free <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="rounded-full" nativeButton={false} render={<Link href="/templates" />}>
                Browse templates
              </Button>
            </div>
          </div>

          {/* Right — resume mockup */}
          <div className="flex items-center justify-center lg:justify-end min-h-95">
            <ResumeMockup />
          </div>

        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section className="relative w-full py-24 border-t overflow-hidden">
        {/* Section line */}
        <SectionLine className="right-6 xl:right-10 top-12 bottom-12" />
        {/* Dot grid — right side */}
        <DotGrid className="pointer-events-none absolute top-0 right-0 w-56 h-56 text-foreground/6 dark:text-foreground/4" size={20} />
        <div className="max-w-5xl mx-auto px-6">
          <div className="mb-16 text-center">
            <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-3">Process</p>
            <h2
              className="text-4xl font-bold"
              style={{ fontFamily: 'var(--font-jost)' }}
            >
              Three steps to done
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 relative">
            {/* Connector line (desktop) */}
            <div className="hidden sm:block absolute top-7 left-[calc(16.666%+1rem)] right-[calc(16.666%+1rem)] h-px bg-border" />

            {HOW_IT_WORKS.map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="flex flex-col items-center text-center gap-4">
                <div className="relative flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full border-2 border-indigo-500/40 bg-indigo-500/8 dark:bg-indigo-500/10 flex items-center justify-center z-10 relative">
                    <Icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <span
                    className="absolute -top-3 -right-3 text-xs font-black text-indigo-500/50"
                    style={{ fontFamily: 'var(--font-jost)' }}
                  >
                    {step}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────── */}
      <section className="relative w-full py-24 bg-muted/40 border-t overflow-hidden">
        {/* Section line */}
        <SectionLine className="left-6 xl:left-10 top-12 bottom-12" />
        {/* Dot grid — bottom left */}
        <DotGrid className="pointer-events-none absolute bottom-0 left-20 w-48 h-48 text-foreground/7 dark:text-foreground/4" size={20} />

        <div className="max-w-4xl mx-auto px-6">
          <div className="mb-16 text-center">
            <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-3">Pricing</p>
            <h2
              className="text-4xl font-bold"
              style={{ fontFamily: 'var(--font-jost)' }}
            >
              <span className="text-indigo-500">Price</span>{' '}
              Board
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto items-start">

            {/* Competitors — plain card */}
            <div className="relative bg-card border rounded-2xl p-8 flex flex-col gap-6 overflow-hidden">
              {/* Dot grid bottom-right */}
              <div
                className="pointer-events-none absolute bottom-3 right-3 w-20 h-20 text-muted-foreground/20"
                style={{ backgroundImage: 'radial-gradient(circle, currentColor 1.5px, transparent 1.5px)', backgroundSize: '12px 12px' }}
              />
              <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                Typical Builders
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black leading-none" style={{ fontFamily: 'var(--font-jost)' }}>10–25</span>
                <span className="text-3xl font-bold text-indigo-500" style={{ fontFamily: 'var(--font-jost)' }}>$</span>
                <span className="ml-1 text-sm text-muted-foreground">/ Month</span>
              </div>
              <p className="text-sm text-muted-foreground -mt-2">
                Locked behind a subscription. Pay every month just to keep access.
              </p>
              <ul className="space-y-3 text-sm flex-1">
                {['PDF download', 'Template access'].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-foreground">
                    <span className="text-indigo-500 font-bold text-base leading-none">✓</span> {f}
                  </li>
                ))}
                {['No subscription', 'No account needed', 'Instant re-download'].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-muted-foreground/60 line-through">
                    <span className="text-muted-foreground/40 font-bold text-base leading-none">✓</span> {f}
                  </li>
                ))}
              </ul>
              <button
                disabled
                className="w-full rounded-full h-12 border-2 border-muted-foreground/20 text-muted-foreground text-sm font-semibold tracking-wide cursor-not-allowed"
                style={{ fontFamily: 'var(--font-jost)' }}
              >
                NOT RECOMMENDED
              </button>
            </div>

            {/* Cvolt — featured card, slightly elevated */}
            <div className="relative bg-card border-2 border-foreground rounded-2xl p-8 flex flex-col gap-6 overflow-hidden shadow-xl">
              {/* Dot grid bottom-right */}
              <div
                className="pointer-events-none absolute bottom-3 right-3 w-20 h-20 text-foreground/10"
                style={{ backgroundImage: 'radial-gradient(circle, currentColor 1.5px, transparent 1.5px)', backgroundSize: '12px 12px' }}
              />              
              <p className="text-xs font-semibold tracking-widest uppercase text-foreground pt-2">
                Cvolt
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black leading-none" style={{ fontFamily: 'var(--font-jost)' }}>1.50</span>
                <span className="text-3xl font-bold text-indigo-500" style={{ fontFamily: 'var(--font-jost)' }}>$</span>
                <span className="ml-1 text-sm text-muted-foreground">One-time</span>
              </div>
              <p className="text-sm text-muted-foreground -mt-2">
                Pay once, download instantly. Re-download for 30 days. No strings attached.
              </p>
              <ul className="space-y-3 text-sm flex-1">
                {['PDF download', 'All templates included', 'No subscription', 'No account needed', '30-day re-download'].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-foreground">
                    <span className="text-indigo-500 font-bold text-base leading-none">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Button
                className="w-full rounded-full h-12 text-sm font-semibold tracking-wide"
                style={{ fontFamily: 'var(--font-jost)' }}
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
      <section className="relative w-full py-24 border-t overflow-hidden">
        <SectionLine className="right-6 xl:right-10 top-12 bottom-12" />
        <DotGrid className="pointer-events-none absolute top-0 right-0 w-44 h-44 text-foreground/6 dark:text-foreground/4" size={20} />
        <div className="max-w-2xl mx-auto px-6">
          <div className="mb-14 text-center">
            <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-3">FAQ</p>
            <h2
              className="text-4xl font-bold"
              style={{ fontFamily: 'var(--font-jost)' }}
            >
              Questions answered
            </h2>
          </div>

          <div className="divide-y">
            {FAQ.map(({ q, a }) => (
              <div key={q} className="py-6">
                <h3 className="font-semibold mb-2 text-[15px]">{q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ───────────────────────────────────────── */}
      <section className="relative w-full border-t bg-muted/40 overflow-hidden">
        <SectionLine className="left-6 xl:left-10 top-10 bottom-10" />

        <DotGrid className="pointer-events-none absolute bottom-0 right-0 w-52 h-52 text-foreground/6 dark:text-foreground/4" size={20} />
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-4">Get started</p>
          <h2
            className="text-4xl sm:text-5xl font-bold mb-4 leading-tight"
            style={{ fontFamily: 'var(--font-jost)' }}
          >
            Your resume,<br />
            <span style={{ WebkitTextStrokeWidth: '1.5px', WebkitTextStrokeColor: 'var(--foreground)', color: 'transparent' }}>
              ready in minutes.
            </span>
          </h2>
          <p className="text-muted-foreground mb-10">
            Free to fill in. Pay only when you&apos;re ready to download.
          </p>
          <Button size="lg" className="rounded-full" nativeButton={false} render={<Link href="/build" />}>
            Start building — it&apos;s free <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

    </div>
  )
}
