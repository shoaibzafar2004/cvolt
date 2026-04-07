export const dynamic = 'force-dynamic'

import { createStripePaymentIntent } from '@/lib/payments'
import { createClient } from '@/lib/supabase/server'
import CheckoutForm from './CheckoutForm'

interface Props {
  searchParams: Promise<{ templateId?: string }>
}

const PRICE_CENTS = 150
const CURRENCY = 'usd'

export default async function CheckoutPage({ searchParams }: Props) {
  const { templateId } = await searchParams

  const supabase = await createClient()

  // Fetch template info for order summary
  const { data: template } = templateId
    ? await supabase.from('templates').select('id, name, slug, thumbnail_url').eq('id', templateId).single()
    : { data: null }

  // Create PaymentIntent server-side — never trust client for amount
  const intent = await createStripePaymentIntent({
    amountCents: PRICE_CENTS,
    currency: CURRENCY,
    metadata: { templateId: templateId ?? '' },
  })

  return (
    <main className="max-w-lg mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>

      {/* Order summary */}
      <div className="border rounded-xl p-4 mb-8 bg-card flex items-center gap-4">
        <div className="w-16 h-20 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground shrink-0">
          {template?.thumbnail_url
            ? <img src={template.thumbnail_url} alt={template.name} className="w-full h-full object-cover rounded" />
            : 'Preview'}
        </div>
        <div className="flex-1">
          <p className="font-medium">{template?.name ?? 'Resume template'}</p>
          <p className="text-sm text-muted-foreground">One-time download · 30-day re-download</p>
        </div>
        <p className="text-xl font-bold">$1.50</p>
      </div>

      <CheckoutForm
        clientSecret={intent.client_secret!}
        templateId={templateId ?? ''}
        publishableKey={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!}
      />
    </main>
  )
}
