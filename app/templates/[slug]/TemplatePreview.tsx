'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useResumeStore } from '@/store/resumeStore'
import { getTemplate } from '@/lib/templates'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ZoomIn, ZoomOut } from 'lucide-react'
import type { Template, ResumeData } from '@/types'

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
      content: { skills: [
        { name: 'TypeScript', level: 'Expert' },
        { name: 'React', level: 'Advanced' },
        { name: 'Node.js', level: 'Advanced' },
        { name: 'PostgreSQL', level: 'Intermediate' },
        { name: 'AWS', level: 'Intermediate' },
      ] },
    },
  ],
}

const ZOOM_MIN = 0.5
const ZOOM_MAX = 1.5
const ZOOM_STEP = 0.1

export default function TemplatePreview({ template }: { template: Template }) {
  const store = useResumeStore()
  const [zoomFactor, setZoomFactor] = useState(1)

  const hasData = !!store.personalInfo.name
  const previewData: ResumeData = hasData
    ? { personalInfo: store.personalInfo, sections: store.sections }
    : PLACEHOLDER

  const TemplateComponent = getTemplate(template.slug)

  // Scale A4 (794px) to fit viewport height minus header — ~80vh
  const A4_WIDTH = 794
  const A4_HEIGHT = 1123
  const targetHeight = typeof window !== 'undefined' ? window.innerHeight * 0.82 : 820
  const baseScale = Math.min(targetHeight / A4_HEIGHT, 1)
  const scale = baseScale * zoomFactor

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)]">
      {/* Left — rendered resume */}
      <div className="flex-1 overflow-auto bg-muted/30 flex flex-col items-center p-8 gap-4">
        {/* Zoom controls */}
        <div className="flex items-center gap-2 bg-background border rounded-lg px-3 py-1.5 shadow-sm shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setZoomFactor((z) => Math.max(ZOOM_MIN, +(z - ZOOM_STEP).toFixed(1)))}
            disabled={zoomFactor <= ZOOM_MIN}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs font-medium text-muted-foreground w-12 text-center">
            {Math.round(zoomFactor * 100)}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setZoomFactor((z) => Math.min(ZOOM_MAX, +(z + ZOOM_STEP).toFixed(1)))}
            disabled={zoomFactor >= ZOOM_MAX}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        <div
          style={{
            width: A4_WIDTH * scale,
            height: A4_HEIGHT * scale,
            overflow: 'hidden',
            boxShadow: '0 4px 32px rgba(0,0,0,0.12)',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: A4_WIDTH,
              height: A4_HEIGHT,
              transformOrigin: 'top left',
              transform: `scale(${scale})`,
            }}
          >
            <TemplateComponent data={previewData} />
          </div>
        </div>
      </div>

      {/* Right — info + CTA */}
      <div className="w-full lg:w-80 border-l bg-card flex flex-col p-8 gap-6 shrink-0">
        <div className="space-y-2">
          <Badge variant="secondary" className="capitalize">{template.category}</Badge>
          <h1 className="text-2xl font-bold">{template.name}</h1>
          <p className="text-muted-foreground text-sm">
            Professional resume template. Download as a pixel-perfect PDF instantly after purchase.
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-3xl font-bold">$1.50</p>
          <p className="text-xs text-muted-foreground">One-time payment · 30-day re-download</p>
        </div>

        <Link
          href={`/checkout?templateId=${template.id}`}
          className="w-full text-center bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Use this template
        </Link>

        <Link
          href="/templates"
          className="text-sm text-muted-foreground text-center hover:text-foreground transition-colors"
        >
          ← Back to all templates
        </Link>

        {!hasData && (
          <p className="text-xs text-muted-foreground border rounded-md p-3 bg-muted/40">
            Showing sample data.{' '}
            <Link href="/build" className="underline">Fill in your details</Link>{' '}
            to see your real resume here.
          </p>
        )}
      </div>
    </div>
  )
}
