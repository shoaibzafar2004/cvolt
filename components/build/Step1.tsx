'use client'

import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { personalInfoSchema, type PersonalInfoFormData } from '@/lib/schemas'
import { useResumeStore } from '@/store/resumeStore'
import { useUIStore } from '@/store/uiStore'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { UserCircle2, Upload, X } from 'lucide-react'
import PhotoCropModal from './PhotoCropModal'
import type { StepSubmitRef } from './StepWrapper'


const Step1 = forwardRef<StepSubmitRef>((_, ref) => {
  const store = useResumeStore()
  const { setStep } = useUIStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [photoPreview, setPhotoPreview] = useState<string>(store.personalInfo.photoUrl ?? '')
  const [rawImageSrc, setRawImageSrc] = useState<string>('')
  const [cropModalOpen, setCropModalOpen] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
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
      photoUrl: store.personalInfo.photoUrl ?? '',
    },
  })

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setRawImageSrc(reader.result as string)
      setCropModalOpen(true)
    }
    reader.readAsDataURL(file)
    // Reset input so re-selecting the same file triggers onChange again
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleCropConfirm(croppedBase64: string) {
    setPhotoPreview(croppedBase64)
    setValue('photoUrl', croppedBase64)
    setCropModalOpen(false)
    setRawImageSrc('')
  }

  function removePhoto() {
    setPhotoPreview('')
    setValue('photoUrl', '')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function onSubmit(data: PersonalInfoFormData) {
    // Preserve fields not owned by Step1 (e.g. summary set in Step4)
    const merged = { ...store.personalInfo, ...data }
    store.setPersonalInfo(merged)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      if (store.resumeId) {
        await supabase
          .from('resumes')
          .update({ personal_info: merged, updated_at: new Date().toISOString() })
          .eq('id', store.resumeId)
      } else {
        const { data: resume } = await supabase
          .from('resumes')
          .insert({ user_id: user.id, personal_info: merged })
          .select('id')
          .single()
        if (resume) store.hydrate({ personalInfo: merged, sections: [] }, resume.id)
      }
      store.markSaved()
    }

    setStep(2)
  }

  useImperativeHandle(ref, () => ({
    submit: () => handleSubmit(onSubmit)(),
  }))

  return (
    <>
    {rawImageSrc && (
      <PhotoCropModal
        imageSrc={rawImageSrc}
        open={cropModalOpen}
        onClose={() => { setCropModalOpen(false); setRawImageSrc('') }}
        onConfirm={handleCropConfirm}
      />
    )}
    <div className="space-y-5">
      {/* Photo upload */}
      <div className="flex items-center gap-5">
        <div
          className="relative w-20 h-20 rounded-full border-2 border-dashed border-border flex items-center justify-center overflow-hidden cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors shrink-0"
          onClick={() => fileInputRef.current?.click()}
        >
          {photoPreview ? (
            <img src={photoPreview} alt="Headshot preview" className="w-full h-full object-cover" />
          ) : (
            <UserCircle2 className="w-9 h-9 text-muted-foreground" />
          )}
        </div>
        <div className="space-y-1.5">
          <p className="text-sm font-medium">Profile photo <span className="text-muted-foreground font-normal">(optional)</span></p>
          <p className="text-xs text-muted-foreground">Used in templates that support a headshot. JPG or PNG, max 2 MB.</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-border hover:bg-muted transition-colors"
            >
              <Upload className="w-3 h-3" /> {photoPreview ? 'Change photo' : 'Upload photo'}
            </button>
            {photoPreview && (
              <button
                type="button"
                onClick={removePhoto}
                className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-border text-destructive hover:bg-destructive/10 transition-colors"
              >
                <X className="w-3 h-3" /> Remove
              </button>
            )}
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handlePhotoChange}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Full name" error={errors.name?.message}>
          <Input placeholder="Jane Smith" spellCheck={true} {...register('name')} />
        </Field>

        <Field label="Job title" error={errors.jobTitle?.message}>
          <Input placeholder="Software Engineer" spellCheck={true} {...register('jobTitle')} />
        </Field>

        <Field label="Email" error={errors.email?.message}>
          <Input type="email" placeholder="jane@example.com" spellCheck={false} {...register('email')} />
        </Field>

        <Field label="Phone" error={errors.phone?.message}>
          <Input placeholder="+1 555 000 0000" spellCheck={false} {...register('phone')} />
        </Field>

        <Field label="Location" error={errors.location?.message}>
          <Input placeholder="New York, NY" spellCheck={false} {...register('location')} />
        </Field>

        <Field label="LinkedIn URL" error={errors.linkedIn?.message} optional>
          <Input placeholder="https://linkedin.com/in/jane" spellCheck={false} {...register('linkedIn')} />
        </Field>

        <Field label="Website" error={errors.website?.message} optional>
          <Input placeholder="https://jane.dev" spellCheck={false} {...register('website')} />
        </Field>
      </div>
    </div>
    </>
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
