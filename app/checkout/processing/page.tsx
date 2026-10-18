'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function ProcessingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const intentId = searchParams.get('payment_intent')
  const redirectStatus = searchParams.get('redirect_status')

  useEffect(() => {
    if (redirectStatus === 'failed' || !intentId) {
      router.replace('/checkout/failed')
      return
    }

    let attempts = 0
    const MAX_ATTEMPTS = 30 // 60 seconds max

    const interval = setInterval(async () => {
      attempts++

      try {
        const res = await fetch(`/api/payment-status?intentId=${intentId}`)
        const data = await res.json()

        if (data.status === 'completed') {
          clearInterval(interval)
          router.replace(`/checkout/success?paymentId=${data.paymentId}`)
        } else if (data.status === 'failed' || attempts >= MAX_ATTEMPTS) {
          clearInterval(interval)
          router.replace('/checkout/failed')
        }
      } catch {
        if (attempts >= MAX_ATTEMPTS) {
          clearInterval(interval)
          router.replace('/checkout/failed')
        }
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [intentId, redirectStatus, router])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <div>
        <h1 className="text-xl font-semibold">Preparing your resume…</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          This usually takes 10–20 seconds. Please don&apos;t close this tab.
        </p>
      </div>
    </main>
  )
}

export default function ProcessingPage() {
  return (
    <Suspense>
      <ProcessingContent />
    </Suspense>
  )
}
