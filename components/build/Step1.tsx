'use client'

import React, { forwardRef, useImperativeHandle } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { personalInfoSchema, type PersonalInfoFormData } from '@/lib/schemas'
import { useResumeStore } from '@/store/resumeStore'
import { useUIStore } from '@/store/uiStore'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import type { StepSubmitRef } from './StepWrapper'

function saveToLocalStorage(data: PersonalInfoFormData) {
  try {
    const draft = JSON.parse(localStorage.getItem('cvolt_draft') || '{}')
    draft.personalInfo = data
    localStorage.setItem('cvolt_draft', JSON.stringify(draft))
  } catch {}
}

const Step1 = forwardRef<StepSubmitRef>((_, ref) => {
  const store = useResumeStore()
  const { setStep } = useUIStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PersonalInfoFormData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      name: store.personalInfo.name,
      jobTitle: store.personalInfo.jobTitle,
      email: store.personalInfo.email,
      phone: store.personalInfo.phone,
      location: store.personalInfo.location,
      linkedIn: store.personalInfo.linkedIn ?? '',
      website: store.personalInfo.website ?? '',
    },
  })

  async function onSubmit(data: PersonalInfoFormData) {
    store.setPersonalInfo(data)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      if (store.resumeId) {
        await supabase
          .from('resumes')
          .update({ personal_info: data, updated_at: new Date().toISOString() })
          .eq('id', store.resumeId)
      } else {
        const { data: resume } = await supabase
          .from('resumes')
          .insert({ user_id: user.id, personal_info: data })
          .select('id')
          .single()
        if (resume) store.hydrate({ personalInfo: data, sections: [] }, resume.id)
      }
      store.markSaved()
    }

    setStep(2)
  }

  useImperativeHandle(ref, () => ({
    submit: () => handleSubmit(onSubmit)(),
  }))

  function onBlur(data: Partial<PersonalInfoFormData>) {
    saveToLocalStorage({ ...store.personalInfo, ...data } as PersonalInfoFormData)
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Full name" error={errors.name?.message}>
          <Input
            placeholder="Jane Smith"
            {...register('name')}
            onBlur={(e) => onBlur({ name: e.target.value })}
          />
        </Field>

        <Field label="Job title" error={errors.jobTitle?.message}>
          <Input
            placeholder="Software Engineer"
            {...register('jobTitle')}
            onBlur={(e) => onBlur({ jobTitle: e.target.value })}
          />
        </Field>

        <Field label="Email" error={errors.email?.message}>
          <Input
            type="email"
            placeholder="jane@example.com"
            {...register('email')}
            onBlur={(e) => onBlur({ email: e.target.value })}
          />
        </Field>

        <Field label="Phone" error={errors.phone?.message}>
          <Input
            placeholder="+1 555 000 0000"
            {...register('phone')}
            onBlur={(e) => onBlur({ phone: e.target.value })}
          />
        </Field>

        <Field label="Location" error={errors.location?.message}>
          <Input
            placeholder="New York, NY"
            {...register('location')}
            onBlur={(e) => onBlur({ location: e.target.value })}
          />
        </Field>

        <Field label="LinkedIn URL" error={errors.linkedIn?.message} optional>
          <Input
            placeholder="https://linkedin.com/in/jane"
            {...register('linkedIn')}
            onBlur={(e) => onBlur({ linkedIn: e.target.value })}
          />
        </Field>

        <Field label="Website" error={errors.website?.message} optional>
          <Input
            placeholder="https://jane.dev"
            {...register('website')}
            onBlur={(e) => onBlur({ website: e.target.value })}
          />
        </Field>
      </div>
    </div>
  )
})

Step1.displayName = 'Step1'
export default Step1

function Field({
  label,
  error,
  optional,
  children,
}: {
  label: string
  error?: string
  optional?: boolean
  children: React.ReactElement
}) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium mb-2 pl-4.5">
        {label}
        {optional && <span className="text-muted-foreground ml-1 font-normal">(optional)</span>}
      </label>
      {React.cloneElement(children as React.ReactElement<React.HTMLAttributes<HTMLElement>>, { 'aria-invalid': !!error || undefined })}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
