export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createStripePaymentIntent } from '@/lib/payments'
import { createClient } from '@/lib/supabase/server'
import CheckoutForm from './CheckoutForm'
import TemplateThumbnail from './TemplateThumbnail'

interface Props {
  searchParams: Promise<{ templateId?: string; slug?: string; name?: string }>
}

const PRICE_CENTS = 150
const CURRENCY = 'usd'

export default async function CheckoutPage({ searchParams }: Props) {
  const { templateId, slug: slugParam, name: nameParam } = await searchParams

  if (!templateId) {
    redirect('/templates')
  }

  const supabase = await createClient()

  // Fetch template info — slug + name from URL params are fallbacks if DB query fails
  const { data: template } = templateId
    ? await supabase.from('templates').select('id, name, slug').eq('id', templateId).single()
    : { data: null }

  const displayName = template?.name ?? (nameParam ? decodeURIComponent(nameParam) : null)
  const displaySlug = template?.slug ?? slugParam ?? null

  const { data: { user } } = await supabase.auth.getUser()

  // Require login before checkout — prevents payment being attributed to a wrong email
  if (!user) {
    redirect(`/login?returnTo=/checkout?templateId=${templateId}`)
  }

  const userEmail = user.email ?? null

  // Create PaymentIntent server-side — never trust client for amount
  const intent = await createStripePaymentIntent({
    amountCents: PRICE_CENTS,
    currency: CURRENCY,
    metadata: {
      templateId: templateId ?? '',
      ...(user?.id ? { userId: user.id } : {}),
      ...(user?.email ? { email: user.email } : {}),
    },
  })

  return (
    <main className="max-w-lg mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>

      {/* Order summary */}
      <div className="border rounded-xl p-4 mb-8 bg-card flex items-center gap-4">
        {/* Live mini preview */}
        <div className="rounded-lg border shadow-sm overflow-hidden bg-white shrink-0">
          {displaySlug
            ? <TemplateThumbnail slug={displaySlug} />
            : <div className="w-20 h-28 flex items-center justify-center text-xs text-muted-foreground bg-muted">Preview</div>
          }
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-base truncate">{displayName ?? 'Resume template'}</p>
          <p className="text-sm text-muted-foreground mt-0.5">One-time download</p>
          <p className="text-xs text-muted-foreground">30-day re-download included</p>
        </div>

        <p className="text-xl font-bold shrink-0">$1.50</p>
      </div>

      <CheckoutForm
        clientSecret={intent.client_secret!}
        templateId={templateId ?? ''}
        userEmail={userEmail}
        publishableKey={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!}
      />
    </main>
  )
}
