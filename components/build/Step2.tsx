'use client'

import { forwardRef, useImperativeHandle } from 'react'
import { useForm, useFieldArray, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { step2Schema, type Step2FormData } from '@/lib/schemas'
import { useResumeStore } from '@/store/resumeStore'
import { useUIStore } from '@/store/uiStore'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import WorkBlock from './WorkBlock'
import type { StepSubmitRef } from './StepWrapper'
import { v4 as uuidv4 } from 'uuid'
import type { Section, WorkContent } from '@/types'
// Note: useResumeStore is used only inside the component below

function buildDefaultEntry() {
  return {
    id: uuidv4(),
    company: '',
    role: '',
    startDate: '',
    endDate: '',
    current: false,
    bullets: [''],
    skills: [] as string[],
  }
}

function storeWorkEntries(
  upsertSection: (section: Section) => void,
  entries: Step2FormData['workEntries']
) {
  entries.forEach((entry, index) => {
    const content: WorkContent = {
      company: entry.company,
      role: entry.role,
      startDate: entry.startDate,
      endDate: entry.endDate,
      current: entry.current,
      bullets: entry.bullets.filter(Boolean),
      skills: entry.skills ?? [],
    }
    const section: Section = {
      id: entry.id,
      type: 'work',
      content,
      displayOrder: index,
    }
    upsertSection(section)
  })
}

const Step2 = forwardRef<StepSubmitRef>((_, ref) => {
  const store = useResumeStore()
  const { setStep } = useUIStore()

  const existingWork = store.sections
    .filter((s) => s.type === 'work')
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((s) => {
      const c = s.content as WorkContent
      return {
        id: s.id,
        company: c.company,
        role: c.role,
        startDate: c.startDate,
        endDate: c.endDate ?? '',
        current: c.current,
        bullets: c.bullets.length ? c.bullets : [''],
        skills: c.skills ?? [],
      }
    })

  const { register, handleSubmit, control, formState: { errors } } = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      workEntries: existingWork.length ? existingWork : [buildDefaultEntry()],
    },
  })

  const { fields, append, remove, move } = useFieldArray({ control, name: 'workEntries' })

  const watchedEntries = useWatch({ control, name: 'workEntries' })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  async function onSubmit(data: Step2FormData) {
    store.sections.filter((s) => s.type === 'work').forEach((s) => store.removeSection(s.id))
    storeWorkEntries(store.upsertSection, data.workEntries)

    if (store.resumeId) {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const sections = store.sections.filter((s) => s.type !== 'work')
        const workSections = data.workEntries.map((entry, i) => ({
          id: entry.id,
          resume_id: store.resumeId!,
          section_type: 'work',
          content: {
            company: entry.company,
            role: entry.role,
            startDate: entry.startDate,
            endDate: entry.endDate,
            current: entry.current,
            bullets: entry.bullets.filter(Boolean),
            skills: entry.skills ?? [],
          },
          display_order: i,
        }))
        // Delete existing work sections then insert fresh ones
        await supabase.from('resume_sections').delete().eq('resume_id', store.resumeId).eq('section_type', 'work')
        if (workSections.length > 0) await supabase.from('resume_sections').insert(workSections)
        void sections // keep linter happy — non-work sections are managed by their own steps
        store.markSaved()
      }
    }

    setStep(3)
  }

  useImperativeHandle(ref, () => ({
    submit: () => handleSubmit(onSubmit)(),
  }))

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id)
      const newIndex = fields.findIndex((f) => f.id === over.id)
      move(oldIndex, newIndex)
    }
  }

  return (
    <div className="space-y-5">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {fields.map((field, index) => (
              <WorkBlock
                key={field.id}
                id={field.id}
                index={index}
                register={register}
                control={control}
                remove={remove}
                errors={errors}
                watchCurrent={watchedEntries?.[index]?.current ?? false}
                watchRole={watchedEntries?.[index]?.role ?? ''}
                watchCompany={watchedEntries?.[index]?.company ?? ''}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Button
        type="button"
        variant="outline"
        className="w-full h-12 border-dashed gap-2 text-sm"
        onClick={() => append(buildDefaultEntry())}
      >
        <Plus className="w-4 h-4" /> Add experience
      </Button>
    </div>
  )
})

Step2.displayName = 'Step2'
export default Step2
