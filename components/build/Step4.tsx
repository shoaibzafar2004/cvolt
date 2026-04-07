'use client'

import { forwardRef, useImperativeHandle } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { summarySchema, type SummaryFormData } from '@/lib/schemas'
import { useResumeStore } from '@/store/resumeStore'
import { useRouter } from 'next/navigation'
import { Textarea } from '@/components/ui/textarea'
import type { StepSubmitRef } from './StepWrapper'

const MAX_CHARS = 500

const Step4 = forwardRef<StepSubmitRef>((_, ref) => {
  const store = useResumeStore()
  const router = useRouter()

  const { register, handleSubmit, watch, formState: { errors } } = useForm<SummaryFormData>({
    resolver: zodResolver(summarySchema),
    defaultValues: { summary: '' },
  })

  const summary = watch('summary') ?? ''

  useImperativeHandle(ref, () => ({
    submit: () => handleSubmit(onSubmit)(),
  }))

  function onSubmit(data: SummaryFormData) {
    // Summary is optional — store as a simple text field in personalInfo extension
    // For now we attach it to the store's personalInfo as a non-schema field
    // It will be surfaced in the template via ResumeData in Phase 3
    if (data.summary) {
      store.setPersonalInfo({ ...store.personalInfo, summary: data.summary } as typeof store.personalInfo & { summary: string })
    }
    router.push('/templates')
  }

  function handleSkip() {
    router.push('/templates')
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Optional — a 2–3 sentence snapshot of your career. You can skip this.
      </p>

      {/* Summary textarea */}
      <div className="space-y-2">
        <Textarea
          className="min-h-32 resize-y"
          placeholder="Results-driven software engineer with 5+ years of experience building scalable web applications..."
          {...register('summary')}
        />
        <div className="flex justify-between items-center">
          {errors.summary ? (
            <p className="text-sm text-destructive">{errors.summary.message}</p>
          ) : (
            <span />
          )}
          <span className={`text-xs ${summary.length > MAX_CHARS ? 'text-destructive' : 'text-muted-foreground'}`}>
            {summary.length} / {MAX_CHARS}
          </span>
        </div>
      </div>

      {/* Mini resume preview — placeholder until CleanTemplate is built in Phase 3 */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Resume preview</p>
        <div className="border rounded-lg bg-muted/30 flex items-center justify-center h-48 text-sm text-muted-foreground">
          Preview available after templates are built
        </div>
      </div>

      {/* Skip button */}
      <button
        type="button"
        onClick={handleSkip}
        className="text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground"
      >
        Skip — go to templates
      </button>
    </div>
  )
})

Step4.displayName = 'Step4'
export default Step4
