'use client'

import type { ResumeData } from '@/types'
import { registry } from '@/lib/templates'
import { useMounted } from '@/hooks/useMounted'

// Renders a template only on the client — never during SSR.
// This prevents React 19's <style> hoisting from causing hydration mismatches.
// PDF generation uses renderToStaticMarkup directly (not Next.js SSR), so it is unaffected.

interface Props {
  slug: string
  data: ResumeData
}

export default function ClientOnlyTemplate({ slug, data }: Props) {
  const mounted = useMounted()
  const Template = registry[slug]

  if (!mounted || !Template) return null
  return <Template data={data} />
}
