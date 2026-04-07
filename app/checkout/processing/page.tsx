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
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 text-center px-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <div>
        <h1 className="text-xl font-semibold">Preparing your resume…</h1>
        <p className="text-sm text-muted-foreground mt-1">
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
