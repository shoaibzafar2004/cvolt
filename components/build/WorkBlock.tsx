'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Controller } from 'react-hook-form'
import type { UseFormRegister, UseFieldArrayRemove, FieldErrors, Control } from 'react-hook-form'
import type { Step2FormData } from '@/lib/schemas'
import { Input } from '@/components/ui/input'
import { MonthPicker } from '@/components/ui/month-picker'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { GripVertical, Trash2 } from 'lucide-react'

interface WorkBlockProps {
  index: number
  id: string
  register: UseFormRegister<Step2FormData>
  control: Control<Step2FormData>
  remove: UseFieldArrayRemove
  errors: FieldErrors<Step2FormData>
  watchCurrent: boolean
}

export default function WorkBlock({ index, id, register, control, remove, errors, watchCurrent }: WorkBlockProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const fieldErrors = errors.workEntries?.[index]

  return (
    <div ref={setNodeRef} style={style} className="border rounded-2xl p-5 space-y-4 bg-muted/30">
      {/* Header row */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="text-muted-foreground cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <span className="text-sm font-medium flex-1">Experience {index + 1}</span>
        {index > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => remove(index)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium mb-2 pl-4.5">Company</label>
          <Input placeholder="Acme Corp" aria-invalid={!!fieldErrors?.company || undefined} {...register(`workEntries.${index}.company`)} />
          {fieldErrors?.company && <p className="text-sm text-destructive">{fieldErrors.company.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium mb-2 pl-4.5">Role</label>
          <Input placeholder="Software Engineer" aria-invalid={!!fieldErrors?.role || undefined} {...register(`workEntries.${index}.role`)} />
          {fieldErrors?.role && <p className="text-sm text-destructive">{fieldErrors.role.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium mb-2 pl-4.5">Start date</label>
          <Controller
            control={control}
            name={`workEntries.${index}.startDate`}
            render={({ field }) => (
              <MonthPicker
                value={field.value}
                onChange={field.onChange}
                placeholder="Select start date"
                aria-invalid={!!fieldErrors?.startDate || undefined}
              />
            )}
          />
          {fieldErrors?.startDate && <p className="text-sm text-destructive">{fieldErrors.startDate.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium mb-2 pl-4.5">End date</label>
          <Controller
            control={control}
            name={`workEntries.${index}.endDate`}
            render={({ field }) => (
              <MonthPicker
                value={field.value}
                onChange={field.onChange}
                placeholder="Select end date"
                disabled={watchCurrent}
              />
            )}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id={`current-${id}`}
          className="rounded"
          {...register(`workEntries.${index}.current`)}
        />
        <label htmlFor={`current-${id}`} className="text-sm">
          I currently work here
        </label>
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium mb-2 pl-4.5">
          Key achievements / responsibilities
          <span className="text-muted-foreground font-normal ml-1">(one per line)</span>
        </label>
        <Textarea
          className="min-h-25 resize-y"
          placeholder="• Reduced API latency by 40% by..."
          {...register(`workEntries.${index}.bullets.0`)}
        />
      </div>
    </div>
  )
}
