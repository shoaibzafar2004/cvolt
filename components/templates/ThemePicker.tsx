'use client'

import { useResumeStore } from '@/store/resumeStore'
import type { ThemeOption } from '@/lib/templates'

interface Props {
  themes: ThemeOption[]
}

export default function ThemePicker({ themes }: Props) {
  const store = useResumeStore()
  const current = store.personalInfo.theme ?? themes[0]?.key

  function select(key: string) {
    store.setPersonalInfo({ ...store.personalInfo, theme: key })
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Color theme</p>
      <div className="flex gap-3">
        {themes.map((t) => {
          const active = current === t.key
          return (
            <button
              key={t.key}
              onClick={() => select(t.key)}
              title={t.label}
              className={[
                'flex flex-col items-center gap-1.5 group',
              ].join(' ')}
            >
              {/* Swatch — two halves showing sidebar + accent */}
              <div
                className={[
                  'w-9 h-9 rounded-full overflow-hidden border-2 transition-all',
                  active
                    ? 'border-foreground scale-110'
                    : 'border-transparent hover:border-muted-foreground',
                ].join(' ')}
                style={{ display: 'flex' }}
              >
                <div style={{ width: '50%', height: '100%', backgroundColor: t.sidebarBg }} />
                <div style={{ width: '50%', height: '100%', backgroundColor: t.accent }} />
              </div>
              <span className={[
                'text-[10px] font-medium transition-colors',
                active ? 'text-foreground' : 'text-muted-foreground',
              ].join(' ')}>
                {t.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
