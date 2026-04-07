'use client'

import { useEffect } from 'react'
import { useResumeStore } from '@/store/resumeStore'
import StepWrapper from '@/components/build/StepWrapper'
import type { ResumeData } from '@/types'

interface EditFormShellProps {
  resumeId: string
  resumeData: ResumeData
}

export default function EditFormShell({ resumeId, resumeData }: EditFormShellProps) {
  const store = useResumeStore()

  useEffect(() => {
    // Skip hydration if store already has this resume loaded
    if (store.resumeId === resumeId) return
    store.hydrate(resumeData, resumeId)
  }, [resumeId]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      {store.isDirty && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-sm text-amber-800 text-center">
          Unsaved changes — complete all steps to save
        </div>
      )}
      <StepWrapper />
    </div>
  )
}
