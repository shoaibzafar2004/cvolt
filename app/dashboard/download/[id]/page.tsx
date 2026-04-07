import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

interface Props {
  params: Promise<{ id: string }>
}

const DIFF_THRESHOLD = 0.10

export default async function DownloadPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?returnTo=/dashboard/download/${id}`)

  // Fetch payment with snapshot
  const { data: payment } = await supabase
    .from('payments')
    .select(`
      id,
      expires_at,
      template_id,
      user_id,
      resume_snapshots ( char_count, resume_id )
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .single()

  if (!payment) notFound()

  // Check 1: within 30 days?
  const expired = new Date(payment.expires_at) < new Date()
  if (expired) redirect(`/checkout?templateId=${payment.template_id}`)

  // Check 2: resume diff under 10%?
  const snapshot = Array.isArray(payment.resume_snapshots)
    ? payment.resume_snapshots[0]
    : payment.resume_snapshots

  if (snapshot?.resume_id) {
    const { data: sections } = await supabase
      .from('resume_sections')
      .select('content')
      .eq('resume_id', snapshot.resume_id)

    const currentCharCount = JSON.stringify(sections ?? []).length
    const diff = Math.abs(currentCharCount - snapshot.char_count) / (snapshot.char_count || 1)

    if (diff > DIFF_THRESHOLD) {
      redirect(`/checkout?templateId=${payment.template_id}`)
    }
  }

  // Both checks passed — get signed PDF URL
  const pdfPath = `resumes/${user.id}/${id}.pdf`
  const { data: signed } = await supabase.storage
    .from('pdfs')
    .createSignedUrl(pdfPath, 300) // 5-minute URL

  const daysLeft = Math.ceil(
    (new Date(payment.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 text-center px-4 max-w-md mx-auto">
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-3xl">
        ↓
      </div>

      <div>
        <h1 className="text-2xl font-bold">Your resume is ready</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {daysLeft} day{daysLeft !== 1 ? 's' : ''} remaining to re-download
        </p>
      </div>

      {signed?.signedUrl ? (
        <a
          href={signed.signedUrl}
          download="resume.pdf"
          className="w-full bg-primary text-primary-foreground py-3 px-6 rounded-lg font-semibold hover:opacity-90 transition-opacity"
        >
          Download PDF
        </a>
      ) : (
        <p className="text-sm text-destructive">
          PDF not found.{' '}
          <Link href={`/checkout?templateId=${payment.template_id}`} className="underline">
            Re-purchase to regenerate
          </Link>
        </p>
      )}

      <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-2">
        ← Back to dashboard
      </Link>
    </main>
  )
}
