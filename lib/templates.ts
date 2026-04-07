import type { ComponentType } from 'react'
import type { ResumeData } from '@/types'

import CleanTemplate from '@/components/resume-templates/CleanTemplate'
import ModernTemplate from '@/components/resume-templates/ModernTemplate'
import CreativeTemplate from '@/components/resume-templates/CreativeTemplate'

export type TemplateComponent = ComponentType<{ data: ResumeData }>

const registry: Record<string, TemplateComponent> = {
  clean: CleanTemplate,
  modern: ModernTemplate,
  creative: CreativeTemplate,
}

export function getTemplate(slug: string): TemplateComponent {
  const component = registry[slug]
  if (!component) throw new Error(`Template not found: ${slug}`)
  return component
}

export function getAllTemplateSlugs(): string[] {
  return Object.keys(registry)
}
