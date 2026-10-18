import { createClient } from '@supabase/supabase-js'

function getServiceClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const intentId = searchParams.get('intentId')

  if (!intentId) {
    return Response.json({ error: 'intentId required' }, { status: 400 })
  }

  const supabase = getServiceClient()

  const { data: payment } = await supabase
    .from('payments')
    .select('id, status')
    .eq('stripe_payment_id', intentId)
    .single()

  if (!payment) {
    return Response.json({ status: 'pending' })
  }

  return Response.json({ status: payment.status, paymentId: payment.id })
}
