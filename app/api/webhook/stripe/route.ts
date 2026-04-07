import { verifyStripeWebhook } from '@/lib/payments'
import { createClient } from '@supabase/supabase-js'
import { generatePdfFromHtml } from '@/lib/pdf'
import { getTemplate } from '@/lib/templates'
import type { ResumeData, WorkContent, EducationContent, SkillsContent } from '@/types'
import { createElement } from 'react'

// Use service role client — webhook runs outside user session
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: Request) {
  const payload = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) return new Response('Missing signature', { status: 400 })

  let event
  try {
    event = verifyStripeWebhook(payload, sig)
  } catch {
    return new Response('Invalid signature', { status: 400 })
  }

  if (event.type !== 'payment_intent.succeeded') {
    return new Response('Ignored', { status: 200 })
  }

  const intent = event.data.object
  const { templateId } = intent.metadata
  const email = intent.receipt_email ?? ''

  const supabase = getServiceClient()

  try {
    // 1. Get or create user from email
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    let userId: string | null = existingUser?.id ?? null

    if (!userId && email) {
      const { data: newUser } = await supabase.auth.admin.createUser({ email, email_confirm: true })
      userId = newUser?.user?.id ?? null
    }

    // 2. Find latest resume for this user (anon draft or authenticated)
    const { data: resume } = userId
      ? await supabase.from('resumes').select('id, personal_info').eq('user_id', userId).order('updated_at', { ascending: false }).limit(1).single()
      : { data: null }

    // 3. Fetch resume sections
    const { data: sections } = resume
      ? await supabase.from('resume_sections').select('*').eq('resume_id', resume.id).order('display_order')
      : { data: [] }

    const resumeData: ResumeData = {
      personalInfo: (resume?.personal_info as ResumeData['personalInfo']) ?? {
        name: '', jobTitle: '', email, phone: '', location: '',
      },
      sections: (sections ?? []).map((s) => ({
        id: s.id,
        type: s.section_type,
        content: s.content as WorkContent | EducationContent | SkillsContent,
        displayOrder: s.display_order,
      })),
    }

    // 4. Step 1 of circular FK fix: insert payment with snapshot_id = null
    const { data: payment } = await supabase
      .from('payments')
      .insert({
        user_id: userId,
        snapshot_id: null,
        template_id: templateId,
        stripe_payment_id: intent.id,
        amount: intent.amount / 100,
        currency: intent.currency,
        status: 'completed',
      })
      .select('id')
      .single()

    if (!payment) throw new Error('Failed to create payment record')

    // 5. Step 2: insert snapshot
    const charCount = JSON.stringify(resumeData).length
    const { data: snapshot } = await supabase
      .from('resume_snapshots')
      .insert({
        resume_id: resume?.id ?? null,
        payment_id: payment.id,
        snapshot_data: resumeData,
        char_count: charCount,
      })
      .select('id')
      .single()

    if (!snapshot) throw new Error('Failed to create snapshot')

    // 6. Step 3: link snapshot back to payment
    await supabase.from('payments').update({ snapshot_id: snapshot.id }).eq('id', payment.id)

    // 7. Generate PDF
    const TemplateComponent = getTemplate(templateId)
    const { renderToStaticMarkup } = await import('react-dom/server')
    const html = renderToStaticMarkup(createElement(TemplateComponent, { data: resumeData }))
    const pdfBuffer = await generatePdfFromHtml(html)

    // 8. Upload PDF to Supabase Storage
    const pdfPath = `resumes/${userId ?? 'anon'}/${payment.id}.pdf`
    await supabase.storage.from('pdfs').upload(pdfPath, pdfBuffer, {
      contentType: 'application/pdf',
      upsert: true,
    })

    // 9. Send magic link so user can access dashboard
    if (email) {
      await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email,
        options: { redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard` },
      })
    }

    return new Response('OK', { status: 200 })
  } catch (err) {
    console.error('Webhook error:', err)
    return new Response('Internal error', { status: 500 })
  }
}

// App Router route handlers receive the raw Request body — no bodyParser config needed.
