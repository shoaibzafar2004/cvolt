'use client'

import Link from 'next/link'
import { useResumeStore } from '@/store/resumeStore'
import ClientOnlyTemplate from '@/components/resume-templates/ClientOnlyTemplate'
import type { Template, Payment, ResumeData } from '@/types'

const CARD_HEIGHT = 340
const A4_WIDTH = 794
const SCALE = 0.38 // slightly zoomed — fills card better than fitting exactly to width

const PLACEHOLDER: ResumeData = {
  personalInfo: {
    name: 'Alex Johnson',
    jobTitle: 'Senior Software Engineer',
    email: 'alex@example.com',
    phone: '+1 555 000 1234',
    location: 'San Francisco, CA',
    linkedIn: 'linkedin.com/in/alexj',
    website: 'alexjohnson.dev',
  },
  sections: [
    {
      id: '1',
      type: 'work',
      displayOrder: 0,
      content: {
        company: 'Acme Corp',
        role: 'Senior Software Engineer',
        startDate: '2021-06',
        current: true,
        bullets: [
          'Led migration from monolith to microservices, cutting deploy time by 60%',
          'Reduced API latency by 40% through query optimization and caching layers',
          'Mentored 3 junior engineers, conducting weekly code reviews and 1-on-1s',
          'Architected real-time notification system handling 500k events/day',
        ],
      },
    },
    {
      id: '4',
      type: 'work',
      displayOrder: 1,
      content: {
        company: 'Startup Inc',
        role: 'Software Engineer',
        startDate: '2019-03',
        endDate: '2021-05',
        current: false,
        bullets: [
          'Built internal analytics dashboard adopted by all 12 product teams, saving 5 hrs/week per team',
          'Integrated Stripe and PayPal payment APIs, enabling $2M+ in annual transactions',
          'Reduced front-end bundle size by 35% through code splitting and lazy loading',
        ],
      },
    },
    {
      id: '6',
      type: 'work',
      displayOrder: 2,
      content: {
        company: 'Freelance',
        role: 'Junior Developer',
        startDate: '2017-06',
        endDate: '2019-02',
        current: false,
        bullets: [
          'Delivered 8 client websites using React and Next.js on time and within budget',
          'Built a custom CMS for a media outlet serving 50k monthly readers',
        ],
      },
    },
    {
      id: '2',
      type: 'education',
      displayOrder: 3,
      content: {
        institution: 'MIT',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        startDate: '2013-09',
        endDate: '2017-05',
        gpa: '3.8',
      },
    },
    {
      id: '10',
      type: 'education',
      displayOrder: 3,
      content: {
        institution: 'Stanford University',
        degree: 'Master of Science',
        field: 'Software Engineering',
        startDate: '2017-09',
        endDate: '2019-06',
        gpa: '3.9',
      },
    },
    {
      id: '11',
      type: 'education',
      displayOrder: 3,
      content: {
        institution: 'Coursera / Google',
        degree: 'Professional Certificate',
        field: 'Cloud Architecture',
        startDate: '2022-01',
        endDate: '2022-06',
      },
    },
    {
      id: '3',
      type: 'skills',
      displayOrder: 4,
      content: {
        skills: [
          { name: 'TypeScript', level: 'Expert' },
          { name: 'React', level: 'Expert' },
          { name: 'Node.js', level: 'Advanced' },
          { name: 'PostgreSQL', level: 'Advanced' },
          { name: 'AWS', level: 'Advanced' },
          { name: 'Docker', level: 'Intermediate' },
          { name: 'GraphQL', level: 'Intermediate' },
          { name: 'Redis', level: 'Intermediate' },
        ],
      },
    },
    {
      id: '12',
      type: 'projects',
      displayOrder: 4,
      content: [
        {
          name: 'DevFlow — CI/CD Dashboard',
          description: 'Real-time pipeline monitoring tool for engineering teams.',
          url: 'github.com/alex/devflow',
          bullets: [
            'Built with Next.js, WebSockets, and PostgreSQL; handles 10k concurrent users',
            'Reduced mean time to detect failures from 12 min to 90 sec',
          ],
        },
        {
          name: 'OpenCart Analytics Plugin',
          description: 'Open-source e-commerce analytics extension with 3k+ GitHub stars.',
          url: 'github.com/alex/oc-analytics',
          bullets: [
            'Tracks funnel drop-off, revenue attribution, and cohort retention',
            'Adopted by 400+ stores across 30 countries',
          ],
        },
        {
          name: 'ResumeBuilder AI',
          description: 'AI-assisted resume tailoring tool built at a 48-hour hackathon.',
          url: 'resumebuilder.vercel.app',
          bullets: [
            'Won 1st place at HackSF 2023 out of 120 teams',
            'Processed 5k resumes in the first week post-launch',
          ],
        },
      ],
    },
    {
      id: '7',
      type: 'certifications',
      displayOrder: 5,
      content: [
        {
          name: 'AWS Certified Solutions Architect',
          issuer: 'Amazon Web Services',
          date: '2023-04',
        },
        { name: 'Professional Scrum Master I', issuer: 'Scrum.org', date: '2022-01' },
      ],
    },
    {
      id: '5',
      type: 'languages',
      displayOrder: 6,
      content: [
        { language: 'English', proficiency: 'Native' },
        { language: 'Spanish', proficiency: 'Intermediate' },
      ],
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

  const payment = payments.find((p) => p.templateId === template.id && p.status === 'completed')
  const isExpired = payment ? new Date(payment.expiresAt) < new Date() : false

  let ctaLabel: string
  let ctaHref: string

  if (!hasData) {
    ctaLabel = 'Fill in resume first'
    ctaHref = `/build?returnTo=/templates/${template.slug}`
  } else if (payment && !isExpired) {
    ctaLabel = 'Re-download'
    ctaHref = `/dashboard/download/${payment.id}`
  } else if (payment && isExpired) {
    ctaLabel = 'Purchase again'
    ctaHref = `/checkout?templateId=${template.id}&slug=${template.slug}&name=${encodeURIComponent(template.name)}`
  } else {
    ctaLabel = 'Use this — $1.50'
    ctaHref = `/checkout?templateId=${template.id}&slug=${template.slug}&name=${encodeURIComponent(template.name)}`
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md">
      {/* Live preview */}
      <Link
        href={`/templates/${template.slug}`}
        className="block overflow-hidden bg-white"
        style={{
          height: CARD_HEIGHT,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}
      >
        {/* Centered box — width = A4 scaled width, clips vertically */}
        <div
          style={{
            width: A4_WIDTH * SCALE,
            height: CARD_HEIGHT,
            overflow: 'hidden',
            flexShrink: 0,
            position: 'relative',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          <div
            style={{
              width: A4_WIDTH,
              transformOrigin: 'top left',
              transform: `scale(${SCALE})`,
              position: 'absolute',
              top: 0,
              left: 0,
            }}
          >
            <ClientOnlyTemplate slug={template.slug} data={previewData} />
          </div>
        </div>
      </Link>

      {/* Footer */}
      <div className="flex items-center justify-between border-t bg-card px-4 py-3">
        <div>
          <p className="text-sm font-medium">{template.name}</p>
          <p className="text-xs text-muted-foreground capitalize">{template.category}</p>
        </div>
        <Link
          href={ctaHref}
          className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium whitespace-nowrap text-primary-foreground transition-opacity hover:opacity-90"
        >
          {ctaLabel}
        </Link>
      </div>
    </div>
  )
}
