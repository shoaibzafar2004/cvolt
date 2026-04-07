'use client'

import React, { forwardRef, useImperativeHandle, useState } from 'react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { step3Schema, type Step3FormData } from '@/lib/schemas'
import { useResumeStore } from '@/store/resumeStore'
import { useUIStore } from '@/store/uiStore'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { MonthPicker } from '@/components/ui/month-picker'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus as PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Trash2, Plus, Award, Globe, Code2, Check } from 'lucide-react'
import type { StepSubmitRef } from './StepWrapper'
import type { EducationContent, SkillsContent, CertificationContent, LanguageContent, ProjectContent } from '@/types'
import { v4 as uuidv4 } from 'uuid'

type ToggleKey = 'certifications' | 'languages' | 'projects'

const Step3 = forwardRef<StepSubmitRef>((_, ref) => {
  const store = useResumeStore()
  const { setStep } = useUIStore()

  const existingEducation = store.sections
    .filter((s) => s.type === 'education')
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((s) => {
      const c = s.content as EducationContent
      return { id: s.id, institution: c.institution, degree: c.degree, field: c.field, startDate: c.startDate, endDate: c.endDate ?? '', gpa: c.gpa ?? '' }
    })

  const existingSkills = store.sections.find((s) => s.type === 'skills')
  const initialSkills = existingSkills ? (existingSkills.content as SkillsContent).skills : []

  const [toggles, setToggles] = useState<Record<ToggleKey, boolean>>({
    certifications: store.sections.some((s) => s.type === 'certifications'),
    languages: store.sections.some((s) => s.type === 'languages'),
    projects: store.sections.some((s) => s.type === 'projects'),
  })
  const [skillInput, setSkillInput] = useState('')
  const [skillLevel, setSkillLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'>('Intermediate')

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<Step3FormData>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      education: existingEducation.length ? existingEducation : [{ id: uuidv4(), institution: '', degree: '', field: '', startDate: '', endDate: '', gpa: '' }],
      skills: initialSkills,
      certifications: (store.sections.find((s) => s.type === 'certifications')?.content as (CertificationContent & { id: string })[] | undefined) ?? [],
      languages: (store.sections.find((s) => s.type === 'languages')?.content as (LanguageContent & { id: string })[] | undefined) ?? [],
      projects: (store.sections.find((s) => s.type === 'projects')?.content as (ProjectContent & { id: string })[] | undefined) ?? [],
    },
  })

  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({ control, name: 'education' })
  const { fields: certFields, append: appendCert, remove: removeCert } = useFieldArray({ control, name: 'certifications' })
  const { fields: langFields, append: appendLang, remove: removeLang } = useFieldArray({ control, name: 'languages' })
  const { fields: projFields, append: appendProj, remove: removeProj } = useFieldArray({ control, name: 'projects' })

  const skills = watch('skills') ?? []

  useImperativeHandle(ref, () => ({
    submit: () => handleSubmit(onSubmit)(),
  }))

  function addSkill() {
    const trimmed = skillInput.trim()
    if (trimmed && !skills.find((s) => s.name === trimmed)) {
      setValue('skills', [...skills, { name: trimmed, level: skillLevel }])
      setSkillInput('')
    }
  }

  function removeSkill(name: string) {
    setValue('skills', skills.filter((s) => s.name !== name))
  }

  function onSubmit(data: Step3FormData) {
    // Clear existing education/skills/optional sections
    ;['education', 'skills', 'certifications', 'languages', 'projects'].forEach((type) => {
      store.sections.filter((s) => s.type === type).forEach((s) => store.removeSection(s.id))
    })

    // Education
    data.education.forEach((entry, i) => {
      const content: EducationContent = { institution: entry.institution, degree: entry.degree, field: entry.field, startDate: entry.startDate, endDate: entry.endDate, gpa: entry.gpa }
      store.upsertSection({ id: entry.id, type: 'education', content, displayOrder: i })
    })

    // Skills
    const skillsId = uuidv4()
    const skillsContent: SkillsContent = { skills: data.skills }
    store.upsertSection({ id: skillsId, type: 'skills', content: skillsContent, displayOrder: 0 })

    // Optional sections — each stored as ONE section with array content
    if (toggles.certifications && data.certifications?.length) {
      const content: CertificationContent[] = data.certifications.map((c) => ({ name: c.name, issuer: c.issuer, date: c.date }))
      store.upsertSection({ id: uuidv4(), type: 'certifications', content, displayOrder: 0 })
    }
    if (toggles.languages && data.languages?.length) {
      const content: LanguageContent[] = data.languages.map((l) => ({ language: l.language, proficiency: l.proficiency }))
      store.upsertSection({ id: uuidv4(), type: 'languages', content, displayOrder: 0 })
    }
    if (toggles.projects && data.projects?.length) {
      const content: ProjectContent[] = data.projects.map((p) => ({ name: p.name, description: p.description, url: p.url, bullets: p.bullets.filter(Boolean) }))
      store.upsertSection({ id: uuidv4(), type: 'projects', content, displayOrder: 0 })
    }

    setStep(4)
  }

  return (
    <div className="space-y-8">
      {/* Education */}
      <section className="space-y-4">
        <h3 className="font-medium">Education</h3>
        {eduFields.map((field, index) => (
          <div key={field.id} className="border rounded-lg p-4 space-y-4 bg-card">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Education {index + 1}</span>
              {eduFields.length > 1 && (
                <Button type="button" variant="ghost" size="icon" onClick={() => removeEdu(index)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1 sm:col-span-2">
                <label className="block text-sm font-medium mb-2 pl-4.5">Institution</label>
                <Input placeholder="MIT" aria-invalid={!!errors.education?.[index]?.institution || undefined} {...register(`education.${index}.institution`)} />
                {errors.education?.[index]?.institution && <p className="text-sm text-destructive">{errors.education[index].institution.message}</p>}
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium mb-2 pl-4.5">Degree</label>
                <Input placeholder="Bachelor of Science" aria-invalid={!!errors.education?.[index]?.degree || undefined} {...register(`education.${index}.degree`)} />
                {errors.education?.[index]?.degree && <p className="text-sm text-destructive">{errors.education[index].degree.message}</p>}
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium mb-2 pl-4.5">Field of study</label>
                <Input placeholder="Computer Science" aria-invalid={!!errors.education?.[index]?.field || undefined} {...register(`education.${index}.field`)} />
                {errors.education?.[index]?.field && <p className="text-sm text-destructive">{errors.education[index].field.message}</p>}
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium mb-2 pl-4.5">Start date</label>
                <Controller
                  control={control}
                  name={`education.${index}.startDate`}
                  render={({ field }) => (
                    <MonthPicker value={field.value} onChange={field.onChange} placeholder="Select start date" aria-invalid={!!errors.education?.[index]?.startDate || undefined} />
                  )}
                />
                {errors.education?.[index]?.startDate && <p className="text-sm text-destructive">{errors.education[index].startDate.message}</p>}
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium mb-2 pl-4.5">End date <span className="text-muted-foreground font-normal">(optional)</span></label>
                <Controller
                  control={control}
                  name={`education.${index}.endDate`}
                  render={({ field }) => (
                    <MonthPicker value={field.value} onChange={field.onChange} placeholder="Select end date" />
                  )}
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium mb-2 pl-4.5">GPA <span className="text-muted-foreground font-normal">(optional)</span></label>
                <Input placeholder="3.8" {...register(`education.${index}.gpa`)} />
              </div>
            </div>
          </div>
        ))}
        <Button type="button" variant="outline" className="w-full h-12 border-dashed border-primary/50 bg-primary/5 text-muted-foreground hover:bg-primary/10 hover:border-primary hover:text-foreground gap-2 text-sm" onClick={() => appendEdu({ id: uuidv4(), institution: '', degree: '', field: '', startDate: '', endDate: '', gpa: '' })}>
          <Plus className="w-4 h-4" /> Add education
        </Button>
      </section>

      {/* Skills */}
      <section className="space-y-3">
        <h3 className="font-medium">Skills</h3>
        <div className="flex gap-2 w-full">
          <Input
            className="flex-1"
            placeholder="e.g. TypeScript"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }}
          />
          <Select value={skillLevel} onValueChange={(v) => setSkillLevel(v as typeof skillLevel)}>
            <SelectTrigger className="w-36 shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(['Beginner', 'Intermediate', 'Advanced', 'Expert'] as const).map((l) => (
                <SelectItem key={l} value={l}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="button" variant="outline" onClick={addSkill} className="h-11 gap-1.5 shrink-0">
            <PlusIcon className="w-3.5 h-3.5" /> Add
          </Button>
        </div>
        {errors.skills && <p className="text-sm text-destructive">{errors.skills.message}</p>}
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span key={skill.name} className="flex items-center gap-1.5 bg-secondary text-secondary-foreground text-sm px-2.5 py-1 rounded-md">
                {skill.name}
                <span className="text-xs text-muted-foreground">· {skill.level}</span>
                <button type="button" onClick={() => removeSkill(skill.name)} className="text-muted-foreground hover:text-foreground ml-0.5">×</button>
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Optional sections */}
      <section className="space-y-4">
        <div>
          <h3 className="font-medium">Optional sections</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Add more detail to stand out — click any section to include it.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {([
            { key: 'certifications', label: 'Certifications', icon: Award },
            { key: 'languages',      label: 'Languages',      icon: Globe  },
            { key: 'projects',       label: 'Projects',       icon: Code2  },
          ] as { key: ToggleKey; label: string; icon: React.ElementType }[]).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setToggles((prev) => ({ ...prev, [key]: !prev[key] }))}
              className={['inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm border transition-colors',
                toggles[key]
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground',
              ].join(' ')}
            >
              {toggles[key] ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
              {label}
            </button>
          ))}
        </div>

        {/* Certifications */}
        {toggles.certifications && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Certifications</h4>
            {certFields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-start">
                <div className="grid grid-cols-3 gap-2 flex-1">
                  <Input placeholder="Certification name" {...register(`certifications.${index}.name`)} />
                  <Input placeholder="Issuer (optional)" {...register(`certifications.${index}.issuer`)} />
                  <Controller
                    control={control}
                    name={`certifications.${index}.date`}
                    render={({ field }) => (
                      <MonthPicker value={field.value} onChange={field.onChange} placeholder="Date" />
                    )}
                  />
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => removeCert(index)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => appendCert({ id: uuidv4(), name: '', issuer: '', date: '' })}><Plus className="w-3 h-3 mr-1" /> Add</Button>
          </div>
        )}

        {/* Languages */}
        {toggles.languages && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Languages</h4>
            {langFields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-start">
                <div className="grid grid-cols-2 gap-2 flex-1">
                  <Input placeholder="Language" {...register(`languages.${index}.language`)} />
                  <Controller
                    control={control}
                    name={`languages.${index}.proficiency`}
                    render={({ field }) => (
                      <Select value={field.value ?? ''} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Proficiency (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {['Native', 'Fluent', 'Advanced', 'Intermediate', 'Basic'].map((level) => (
                            <SelectItem key={level} value={level}>{level}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => removeLang(index)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => appendLang({ id: uuidv4(), language: '', proficiency: '' })}><Plus className="w-3 h-3 mr-1" /> Add</Button>
          </div>
        )}

        {/* Projects */}
        {toggles.projects && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Projects</h4>
            {projFields.map((field, index) => (
              <div key={field.id} className="border rounded-lg p-4 space-y-3 bg-card">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Project {index + 1}</span>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeProj(index)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
                <Input placeholder="Project name" {...register(`projects.${index}.name`)} />
                <Input placeholder="URL (optional)" {...register(`projects.${index}.url`)} />
                <Textarea
                  className="min-h-20 resize-y"
                  placeholder="Brief description"
                  {...register(`projects.${index}.description`)}
                />
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => appendProj({ id: uuidv4(), name: '', description: '', url: '', bullets: [''] })}><Plus className="w-3 h-3 mr-1" /> Add project</Button>
          </div>
        )}
      </section>
    </div>
  )
})

Step3.displayName = 'Step3'
export default Step3
