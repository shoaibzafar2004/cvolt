'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

interface MonthPickerProps {
  value?: string        // "YYYY-MM" format
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  'aria-invalid'?: boolean
}

export function MonthPicker({ value, onChange, placeholder = 'Select month', disabled, 'aria-invalid': ariaInvalid }: MonthPickerProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const parsed = value ? { year: parseInt(value.split('-')[0]), month: parseInt(value.split('-')[1]) - 1 } : null
  const [viewYear, setViewYear] = useState(parsed?.year ?? new Date().getFullYear())

  const displayValue = parsed ? `${MONTHS[parsed.month]} ${parsed.year}` : null

  function handleSelect(monthIndex: number) {
    const mm = String(monthIndex + 1).padStart(2, '0')
    onChange(`${viewYear}-${mm}`)
    setOpen(false)
  }

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        aria-invalid={ariaInvalid}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={cn(
          'h-11 w-full flex items-center justify-between rounded-full border border-foreground/30 bg-transparent px-4 py-2 text-sm outline-none transition-colors',
          'hover:border-foreground/50',
          'focus-visible:border-foreground focus-visible:ring-2 focus-visible:ring-foreground/10',
          'disabled:pointer-events-none disabled:opacity-50',
          ariaInvalid && 'border-destructive ring-2 ring-destructive/20',
          !displayValue && 'text-muted-foreground',
        )}
      >
        <span>{displayValue ?? placeholder}</span>
        <CalendarDays className="w-4 h-4 text-muted-foreground shrink-0" />
      </button>

      {/* Dropdown — absolutely positioned, no layout impact */}
      {open && (
        <div className="absolute z-50 mt-1 w-64 rounded-lg border bg-popover p-3 shadow-md">
          {/* Year navigation */}
          <div className="flex items-center justify-between mb-3">
            <Button type="button" variant="ghost" size="icon" onClick={() => setViewYear((y) => y - 1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-semibold">{viewYear}</span>
            <Button type="button" variant="ghost" size="icon" onClick={() => setViewYear((y) => y + 1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Month grid */}
          <div className="grid grid-cols-3 gap-1">
            {MONTHS.map((month, i) => {
              const isSelected = parsed?.year === viewYear && parsed?.month === i
              return (
                <button
                  key={month}
                  type="button"
                  onClick={() => handleSelect(i)}
                  className={cn(
                    'rounded-md px-2 py-1.5 text-sm transition-colors',
                    isSelected
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'hover:bg-muted text-foreground',
                  )}
                >
                  {month}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
