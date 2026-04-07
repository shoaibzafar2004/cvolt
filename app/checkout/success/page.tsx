import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Suspense } from 'react'

async function SuccessContent({ paymentId }: { paymentId: string }) {
  const supabase = await createClient()

  const { data: payment } = await supabase
    .from('payments')
    .select('id, expires_at, purchased_at')
    .eq('id', paymentId)
    .single()

  const expiresAt = payment?.expires_at ? new Date(payment.expires_at) : null
  const daysLeft = expiresAt
    ? Math.max(0, Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 30

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-8 text-center px-4 max-w-md mx-auto">
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-3xl">
        ✓
      </div>

      <div>
        <h1 className="text-2xl font-bold">Payment confirmed!</h1>
        <p className="text-muted-foreground mt-2">
          Your resume PDF is ready. Check your email for a download link too.
        </p>
      </div>

      <Link
        href={`/dashboard/download/${paymentId}`}
        className="w-full bg-primary text-primary-foreground py-3 px-6 rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity"
      >
        Download resume
      </Link>

      <div className="text-sm text-muted-foreground border rounded-lg px-4 py-3 bg-muted/30 w-full">
        <span className="font-medium text-foreground">{daysLeft} days</span> remaining to re-download
      </div>

      <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-2">
        View my dashboard
      </Link>
    </main>
  )
}

interface Props {
  searchParams: Promise<{ paymentId?: string }>
}

export default async function SuccessPage({ searchParams }: Props) {
  const { paymentId } = await searchParams
  if (!paymentId) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">No payment found.</p>
      </main>
    )
  }
  return (
    <Suspense>
      <SuccessContent paymentId={paymentId} />
    </Suspense>
  )
}
