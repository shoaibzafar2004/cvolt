import type { ComponentType } from 'react'
import type { ResumeData } from '@/types'

import CleanTemplate from '@/components/resume-templates/CleanTemplate'
import ModernTemplate from '@/components/resume-templates/ModernTemplate'
import CreativeTemplate from '@/components/resume-templates/CreativeTemplate'
import ElegantTemplate from '@/components/resume-templates/ElegantTemplate'
import ElegantSingleTemplate from '@/components/resume-templates/ElegantSingleTemplate'
import ElegantDarkTemplate from '@/components/resume-templates/ElegantDarkTemplate'
import ElegantBannerTemplate from '@/components/resume-templates/ElegantBannerTemplate'
import BoldPhotoTemplate, { BOLD_PHOTO_THEMES } from '@/components/resume-templates/BoldPhotoTemplate'

export type TemplateComponent = ComponentType<{ data: ResumeData }>

export interface ThemeOption {
  key: string
  label: string
  sidebarBg: string
  accent: string
}

// Map from template slug → available color themes. Only present if the template supports theming.
export const TEMPLATE_THEMES: Record<string, ThemeOption[]> = {
  'bold-photo': Object.entries(BOLD_PHOTO_THEMES).map(([key, t]) => ({
    key,
    label: t.label,
    sidebarBg: t.sidebarBg,
    accent: t.accent,
  })),
}

const registry: Record<string, TemplateComponent> = {
  clean: CleanTemplate,
  modern: ModernTemplate,
  creative: CreativeTemplate,
  elegant: ElegantTemplate,
  'elegant-single': ElegantSingleTemplate,
  'elegant-dark': ElegantDarkTemplate,
  'elegant-banner': ElegantBannerTemplate,
  'bold-photo': BoldPhotoTemplate,
}

export function getTemplate(slug: string): TemplateComponent {
  const component = registry[slug]
  if (!component) throw new Error(`Template not found: ${slug}`)
  return component
}

export function getAllTemplateSlugs(): string[] {
  return Object.keys(registry)
}
