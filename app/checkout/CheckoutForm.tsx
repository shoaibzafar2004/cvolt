'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface CheckoutFormProps {
  clientSecret: string
  templateId: string
  publishableKey: string
}

export default function CheckoutForm({ clientSecret, templateId, publishableKey }: CheckoutFormProps) {
  const stripePromise = loadStripe(publishableKey)

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
      <InnerForm templateId={templateId} />
    </Elements>
  )
}

function InnerForm({ templateId }: { templateId: string }) {
  const stripe = useStripe()
  const elements = useElements()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return

    setLoading(true)
    setError(null)

    const { error: submitError } = await elements.submit()
    if (submitError) {
      setError(submitError.message ?? 'Something went wrong')
      setLoading(false)
      return
    }

    const returnUrl = `${window.location.origin}/checkout/processing?templateId=${templateId}&email=${encodeURIComponent(email)}`

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl, receipt_email: email },
    })

    if (confirmError) {
      setError(confirmError.message ?? 'Payment failed')
      setLoading(false)
    }
    // On success Stripe redirects to return_url automatically
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1">
        <label className="text-sm font-medium">Email</label>
        <Input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <p className="text-xs text-muted-foreground">We&apos;ll send your download link here.</p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Payment</label>
        <div className="border rounded-lg p-4">
          <PaymentElement />
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" className="w-full" disabled={!stripe || loading}>
        {loading ? 'Processing...' : 'Pay $1.50 and download'}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        No subscription. No refunds after PDF download.
      </p>
    </form>
  )
}
