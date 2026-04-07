'use client'

import { useUIStore } from '@/store/uiStore'
import FilterBar from '@/components/templates/FilterBar'
import TemplateCard from '@/components/templates/TemplateCard'
import type { Template, Payment } from '@/types'

interface TemplateGalleryProps {
  templates: Template[]
  payments: Payment[]
}

export default function TemplateGallery({ templates, payments }: TemplateGalleryProps) {
  const { activeFilter } = useUIStore()

  const filtered = activeFilter === 'all'
    ? templates
    : templates.filter((t) => t.category === activeFilter)

  return (
    <div className="space-y-6">
      <FilterBar />

      {filtered.length === 0 ? (
        <p className="text-muted-foreground text-sm py-12 text-center">
          No templates in this category yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((template) => (
            <TemplateCard key={template.id} template={template} payments={payments} />
          ))}
        </div>
      )}
    </div>
  )
}
