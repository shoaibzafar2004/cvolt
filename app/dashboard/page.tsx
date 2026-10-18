import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { Download, Pencil, Plus, Clock } from 'lucide-react'

export const dynamic = 'force-dynamic'

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

function daysRemaining(expiresAt: string): number {
  return Math.max(
    0,
    Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
  )
}

// Mini resume mockup thumbnail — purely decorative, matches template slug colours
function TemplateMockup({ slug, name }: { slug?: string; name?: string }) {
  const isModern = slug === 'modern'
  const isCreative = slug === 'creative'
  const accentBg = isCreative ? '#7c3aed' : isModern ? '#1e293b' : '#4f46e5'

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: '#f8fafc',
      }}
    >
      {/* Header bar */}
      <div style={{ background: accentBg, padding: '12px 14px 10px' }}>
        <div
          style={{
            height: 7,
            width: '60%',
            borderRadius: 4,
            background: 'rgba(255,255,255,0.85)',
            marginBottom: 5,
          }}
        />
        <div
          style={{ height: 4, width: '40%', borderRadius: 4, background: 'rgba(255,255,255,0.45)' }}
        />
      </div>

      {/* Body lines */}
      <div
        style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}
      >
        {/* Section label */}
        <div
          style={{ height: 3, width: '30%', borderRadius: 3, background: accentBg, opacity: 0.6 }}
        />
        {[70, 90, 55, 80].map((w, i) => (
          <div
            key={i}
            style={{ height: 3, width: `${w}%`, borderRadius: 3, background: '#cbd5e1' }}
          />
        ))}
        <div
          style={{
            height: 3,
            width: '25%',
            borderRadius: 3,
            background: accentBg,
            opacity: 0.6,
            marginTop: 4,
          }}
        />
        <div style={{ display: 'flex', gap: 5 }}>
          {[38, 28, 44].map((w, i) => (
            <div
              key={i}
              style={{
                height: 12,
                width: w,
                borderRadius: 6,
                background: isCreative ? '#ede9fe' : '#e0e7ff',
              }}
            />
          ))}
        </div>
      </div>

      {/* Template name pill at bottom */}
      <div style={{ padding: '0 14px 10px', display: 'flex', alignItems: 'center', gap: 4 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: accentBg }} />
        <span
          style={{
            fontSize: 8,
            color: '#94a3b8',
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          {name ?? slug}
        </span>
      </div>
    </div>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const serviceClient = getServiceClient()

  const { data: payments } = await serviceClient
    .from('payments')
    .select(
      'id, purchased_at, expires_at, status, snapshot_id, templates ( name, slug, thumbnail_url )',
    )
    .eq('user_id', user!.id)
    .eq('status', 'completed')
    .order('purchased_at', { ascending: false })

  const snapshotIds = (payments ?? []).map((p) => p.snapshot_id).filter(Boolean) as string[]
  const { data: snapshots } = snapshotIds.length
    ? await serviceClient.from('resume_snapshots').select('id, snapshot_data').in('id', snapshotIds)
    : { data: [] }
  const snapshotMap = new Map((snapshots ?? []).map((s) => [s.id, s]))

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* ── Page header ─────────────────────────────── */}
      <div className="border-b bg-muted/30">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <p className="mb-2 text-xs font-medium tracking-widest text-muted-foreground uppercase">
            Dashboard
          </p>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1
                className="text-3xl leading-tight font-bold"
                style={{ fontFamily: 'var(--font-jost)' }}
              >
                My resumes
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">{user!.email}</p>
            </div>
            <Link
              href="/build"
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold whitespace-nowrap text-background transition-opacity hover:opacity-85"
              style={{ fontFamily: 'var(--font-jost)' }}
            >
              <Plus className="h-3.5 w-3.5" />
              New resume
            </Link>
          </div>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────── */}
      <div className="mx-auto max-w-5xl px-6 py-10">
        {!payments?.length ? (
          /* ── Empty state ── */
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/10">
              <Download className="h-7 w-7 text-indigo-500" />
            </div>
            <h2 className="mb-2 text-xl font-semibold" style={{ fontFamily: 'var(--font-jost)' }}>
              No purchased resumes yet
            </h2>
            <p className="mb-8 max-w-xs text-sm text-muted-foreground">
              Build your resume for free, then pay $1.50 to download a pixel-perfect PDF.
            </p>
            <Link
              href="/build"
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-85"
              style={{ fontFamily: 'var(--font-jost)' }}
            >
              Build your first resume →
            </Link>
          </div>
        ) : (
          /* ── Resume grid ── */
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {payments.map((payment) => {
              const template = Array.isArray(payment.templates)
                ? payment.templates[0]
                : payment.templates
              const days = daysRemaining(payment.expires_at)
              const expired = days === 0
              const snapshot = payment.snapshot_id ? snapshotMap.get(payment.snapshot_id) : null
              const resumeName = (
                snapshot?.snapshot_data as { personalInfo?: { name?: string } } | null
              )?.personalInfo?.name

              return (
                <div
                  key={payment.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border bg-card transition-shadow duration-200 hover:shadow-md"
                >
                  {/* ── Thumbnail ── */}
                  <div className="relative h-44 overflow-hidden border-b">
                    <TemplateMockup slug={template?.slug} name={template?.name} />

                    {/* Expiry overlay badge */}
                    <div className="absolute top-3 right-3">
                      {expired ? (
                        <span className="text-destructive-foreground inline-flex items-center gap-1 rounded-full bg-destructive/90 px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase backdrop-blur-sm">
                          Expired
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border bg-background/85 px-2.5 py-1 text-[10px] font-semibold tracking-wider text-foreground uppercase backdrop-blur-sm">
                          <Clock className="h-2.5 w-2.5 text-indigo-500" />
                          {days}d left
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ── Info ── */}
                  <div className="flex flex-1 flex-col gap-4 p-5">
                    <div>
                      <p
                        className="leading-tight font-semibold"
                        style={{ fontFamily: 'var(--font-jost)' }}
                      >
                        {resumeName || 'Resume'}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground capitalize">
                        {template?.name ?? '—'} template ·{' '}
                        {new Date(payment.purchased_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="mt-auto flex gap-2">
                      <Link
                        href={`/dashboard/edit/${payment.id}`}
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border py-2 text-xs font-medium transition-colors hover:bg-muted"
                      >
                        <Pencil className="h-3 w-3" />
                        Edit
                      </Link>
                      <Link
                        href={`/dashboard/download/${payment.id}`}
                        className={[
                          'inline-flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-xs font-semibold transition-opacity',
                          expired
                            ? 'pointer-events-none cursor-not-allowed bg-muted text-muted-foreground'
                            : 'bg-foreground text-background hover:opacity-80',
                        ].join(' ')}
                      >
                        <Download className="h-3 w-3" />
                        Download
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
