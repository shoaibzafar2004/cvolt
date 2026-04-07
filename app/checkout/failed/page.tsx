import Link from 'next/link'
import { Suspense } from 'react'

function FailedContent() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-8 text-center px-4 max-w-md mx-auto">
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-3xl">
        ✕
      </div>

      <div>
        <h1 className="text-2xl font-bold">Payment failed</h1>
        <p className="text-muted-foreground mt-2">
          Your card was not charged. This can happen if your card was declined or the session expired.
        </p>
      </div>

      <Link
        href="/checkout"
        className="w-full bg-primary text-primary-foreground py-3 px-6 rounded-lg font-semibold hover:opacity-90 transition-opacity"
      >
        Try again
      </Link>

      <Link href="/templates" className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-2">
        ← Back to templates
      </Link>
    </main>
  )
}

export default function FailedPage() {
  return (
    <Suspense>
      <FailedContent />
    </Suspense>
  )
}
