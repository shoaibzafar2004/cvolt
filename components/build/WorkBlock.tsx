'use client'

import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Controller } from 'react-hook-form'
import type { UseFormRegister, UseFieldArrayRemove, FieldErrors, Control } from 'react-hook-form'
import type { Step2FormData } from '@/lib/schemas'
import { Input } from '@/components/ui/input'
import { MonthPicker } from '@/components/ui/month-picker'
import { Button } from '@/components/ui/button'
import BulletEditor from './BulletEditor'
import { GripVertical, Trash2, X } from 'lucide-react'

interface WorkBlockProps {
  index: number
  id: string
  register: UseFormRegister<Step2FormData>
  control: Control<Step2FormData>
  remove: UseFieldArrayRemove
  errors: FieldErrors<Step2FormData>
  watchCurrent: boolean
  watchRole: string
  watchCompany: string
}

export default function WorkBlock({ index, id, register, control, remove, errors, watchCurrent, watchRole, watchCompany }: WorkBlockProps) {
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
        <span className="text-sm font-medium flex-1">
          {watchRole && watchCompany
            ? `${watchRole} at ${watchCompany}`
            : watchRole || watchCompany || `Experience ${index + 1}`}
        </span>
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
          <Input placeholder="Acme Corp" spellCheck={false} aria-invalid={!!fieldErrors?.company || undefined} {...register(`workEntries.${index}.company`)} />
          {fieldErrors?.company && <p className="text-sm text-destructive">{fieldErrors.company.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium mb-2 pl-4.5">Role</label>
          <Input placeholder="Software Engineer" spellCheck={true} aria-invalid={!!fieldErrors?.role || undefined} {...register(`workEntries.${index}.role`)} />
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
        </label>
        <Controller
          control={control}
          name={`workEntries.${index}.bullets`}
          render={({ field }) => (
            <BulletEditor value={field.value} onChange={field.onChange} />
          )}
        />
      </div>

      {/* Skills used at this job */}
      <Controller
        control={control}
        name={`workEntries.${index}.skills`}
        render={({ field }) => (
          <SkillTagInput
            value={field.value ?? []}
            onChange={field.onChange}
          />
        )}
      />
    </div>
  )
}

function SkillTagInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [input, setInput] = useState('')

  function add() {
    const trimmed = input.trim()
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed])
    }
    setInput('')
  }

  function remove(skill: string) {
    onChange(value.filter((s) => s !== skill))
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium pl-4.5">
        Technologies / tools used
        <span className="text-muted-foreground font-normal ml-1">(optional)</span>
      </label>

      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          placeholder="e.g. React, Node.js, PostgreSQL"
          spellCheck={false}
          className="flex-1"
        />
        <Button type="button" variant="outline" onClick={add} className="shrink-0 rounded-full px-5 h-11">
          Add
        </Button>
      </div>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground text-xs px-2.5 py-1 rounded-md"
            >
              {skill}
              <button
                type="button"
                onClick={() => remove(skill)}
                className="text-muted-foreground hover:text-foreground ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
