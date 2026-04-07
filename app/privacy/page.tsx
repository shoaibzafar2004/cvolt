export const metadata = { title: 'Privacy Policy — Cvolt' }

export default function PrivacyPage() {
  return (
    <article className="max-w-2xl mx-auto px-4 py-12 prose prose-sm">
      <h1 className="text-2xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-muted-foreground text-sm mb-8">Last updated: April 2026</p>

      <section className="space-y-4 text-sm text-muted-foreground">
        <div>
          <h2 className="text-base font-semibold text-foreground mb-1">What we collect</h2>
          <p>We collect the information you provide when building your resume — name, email, work history, education, and skills. We also collect your email address at checkout to send your download link.</p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-foreground mb-1">How we use it</h2>
          <p>Your resume data is used solely to generate your PDF and to let you re-download it within the 30-day window. We do not sell your data to third parties.</p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-foreground mb-1">Payment data</h2>
          <p>Payments are processed by Stripe and Safepay. We do not store card numbers. We only receive a payment confirmation and transaction ID.</p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-foreground mb-1">Cookies</h2>
          <p>We use a session cookie to keep you signed in. No tracking or advertising cookies are used.</p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-foreground mb-1">Data retention</h2>
          <p>Resume data and PDFs are retained for 30 days after purchase to support re-downloads, then deleted. You may request deletion at any time by contacting us.</p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-foreground mb-1">Contact</h2>
          <p>Questions? Email us at privacy@cvolt.app.</p>
        </div>
      </section>
    </article>
  )
}
