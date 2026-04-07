'use client'

import Link from 'next/link'
import { useResumeStore } from '@/store/resumeStore'
import { getTemplate } from '@/lib/templates'
import type { Template, Payment, ResumeData } from '@/types'

const CARD_WIDTH = 260
const CARD_HEIGHT = 340
const A4_WIDTH = 794
const SCALE = CARD_WIDTH / A4_WIDTH

const PLACEHOLDER: ResumeData = {
  personalInfo: {
    name: 'Alex Johnson',
    jobTitle: 'Senior Software Engineer',
    email: 'alex@example.com',
    phone: '+1 555 000 1234',
    location: 'San Francisco, CA',
    linkedIn: 'linkedin.com/in/alexj',
  },
  sections: [
    {
      id: '1',
      type: 'work',
      displayOrder: 0,
      content: {
        company: 'Acme Corp',
        role: 'Software Engineer',
        startDate: '2021-06',
        current: true,
        bullets: ['Led migration to microservices architecture', 'Reduced API latency by 40%'],
      },
    },
    {
      id: '2',
      type: 'education',
      displayOrder: 1,
      content: {
        institution: 'MIT',
        degree: 'B.Sc.',
        field: 'Computer Science',
        startDate: '2017-09',
        endDate: '2021-05',
      },
    },
    {
      id: '3',
      type: 'skills',
      displayOrder: 2,
      content: { skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'AWS'] },
    },
  ],
}

interface TemplateCardProps {
  template: Template
  payments: Payment[]
}

export default function TemplateCard({ template, payments }: TemplateCardProps) {
  const store = useResumeStore()

  const hasData = !!store.personalInfo.name
  const previewData = hasData
    ? { personalInfo: store.personalInfo, sections: store.sections }
    : PLACEHOLDER

  const TemplateComponent = getTemplate(template.slug)

  const payment = payments.find((p) => p.templateId === template.id && p.status === 'completed')
  const isExpired = payment ? new Date(payment.expiresAt) < new Date() : false

  let ctaLabel = `Use this — $1.50`
  let ctaHref = `/checkout?templateId=${template.id}`

  if (payment && !isExpired) {
    ctaLabel = 'Re-download'
    ctaHref = `/dashboard/download/${payment.id}`
  } else if (payment && isExpired) {
    ctaLabel = 'Purchase again'
    ctaHref = `/checkout?templateId=${template.id}`
  }

  return (
    <div className="group flex flex-col rounded-xl border bg-card overflow-hidden hover:shadow-md transition-shadow">
      {/* Live preview */}
      <Link href={`/templates/${template.slug}`} className="block overflow-hidden bg-white" style={{ height: CARD_HEIGHT }}>
        <div
          style={{
            width: A4_WIDTH,
            transformOrigin: 'top left',
            transform: `scale(${SCALE})`,
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          <TemplateComponent data={previewData} />
        </div>
      </Link>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t bg-card">
        <div>
          <p className="text-sm font-medium">{template.name}</p>
          <p className="text-xs text-muted-foreground capitalize">{template.category}</p>
        </div>
        <Link
          href={ctaHref}
          className="text-xs font-medium bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          {ctaLabel}
        </Link>
      </div>
    </div>
  )
}
