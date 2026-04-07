'use client'

import { useUIStore } from '@/store/uiStore'

const FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Clean', value: 'clean' },
  { label: 'Modern', value: 'modern' },
  { label: 'Creative', value: 'creative' },
] as const

export default function FilterBar() {
  const { activeFilter, setFilter } = useUIStore()

  return (
    <div className="flex gap-2 flex-wrap">
      {FILTERS.map(({ label, value }) => (
        <button
          key={value}
          onClick={() => setFilter(value)}
          className={[
            'px-4 py-1.5 rounded-full text-sm border transition-colors',
            activeFilter === value
              ? 'bg-primary text-primary-foreground border-primary'
              : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground',
          ].join(' ')}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
