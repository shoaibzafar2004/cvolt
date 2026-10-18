export const metadata = { title: 'Terms of Service — Cvolt' }

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-2 text-2xl font-bold">Terms of Service</h1>
      <p className="mb-8 text-sm text-muted-foreground">Last updated: April 2026</p>

      <div className="space-y-6 text-sm text-muted-foreground">
        <div>
          <h2 className="mb-1 text-base font-semibold text-foreground">Service</h2>
          <p>
            Cvolt provides a one-time-pay resume building and PDF download service. By using Cvolt
            you agree to these terms.
          </p>
        </div>

        <div>
          <h2 className="mb-1 text-base font-semibold text-foreground">Payment and refunds</h2>
          <p>
            All payments are final.{' '}
            <strong className="text-foreground">
              No refunds are issued after the PDF has been downloaded.
            </strong>{' '}
            If you experience a technical failure before downloading, contact us within 24 hours for
            a full refund.
          </p>
        </div>

        <div>
          <h2 className="mb-1 text-base font-semibold text-foreground">Re-download window</h2>
          <p>
            You may re-download your purchased resume within 30 days of purchase, provided the
            resume content has not changed by more than 10%. Significant edits require a new
            purchase.
          </p>
        </div>

        <div>
          <h2 className="mb-1 text-base font-semibold text-foreground">Content</h2>
          <p>
            You retain full ownership of the resume content you provide. You grant Cvolt a limited
            licence to store and process it solely for PDF generation.
          </p>
        </div>

        <div>
          <h2 className="mb-1 text-base font-semibold text-foreground">Limitation of liability</h2>
          <p>
            Cvolt is provided as-is. We are not liable for any damages arising from use of the
            service beyond the amount you paid.
          </p>
        </div>

        <div>
          <h2 className="mb-1 text-base font-semibold text-foreground">Contact</h2>
          <p>Questions about these terms? Email legal@cvolt.app.</p>
        </div>
      </div>
    </article>
  )
}
