import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PersonalInfo, ResumeData, Section, SectionType } from '@/types'

const defaultPersonalInfo: PersonalInfo = {
  name: '',
  jobTitle: '',
  email: '',
  phone: '',
  location: '',
  linkedIn: '',
  website: '',
}

interface ResumeStore {
  resumeId: string | null
  mode: 'create' | 'edit'
  personalInfo: PersonalInfo
  sections: Section[]
  isDirty: boolean
  lastSaved: Date | null

  setPersonalInfo: (info: PersonalInfo) => void
  upsertSection: (section: Section) => void
  removeSection: (id: string) => void
  reorderSections: (type: SectionType, orderedIds: string[]) => void
  hydrate: (data: ResumeData, id: string) => void
  reset: () => void
  markSaved: () => void
}

export const useResumeStore = create<ResumeStore>()(
  persist(
    (set) => ({
      resumeId: null,
      mode: 'create' as const,
      personalInfo: defaultPersonalInfo,
      sections: [],
      isDirty: false,
      lastSaved: null,

      setPersonalInfo: (info) =>
        set({ personalInfo: info, isDirty: true }),

      upsertSection: (section) =>
        set((state) => {
          const existing = state.sections.findIndex((s) => s.id === section.id)
          const sections =
            existing >= 0
              ? state.sections.map((s) => (s.id === section.id ? section : s))
              : [...state.sections, section]
          return { sections, isDirty: true }
        }),

      removeSection: (id) =>
        set((state) => ({
          sections: state.sections.filter((s) => s.id !== id),
          isDirty: true,
        })),

      reorderSections: (type, orderedIds) =>
        set((state) => ({
          sections: state.sections.map((s) => {
            if (s.type !== type) return s
            const order = orderedIds.indexOf(s.id)
            return order >= 0 ? { ...s, displayOrder: order } : s
          }),
          isDirty: true,
        })),

      hydrate: (data, id) =>
        set({
          resumeId: id,
          mode: 'edit',
          personalInfo: data.personalInfo,
          sections: data.sections,
          isDirty: false,
          lastSaved: null,
        }),

      reset: () =>
        set({
          resumeId: null,
          mode: 'create',
          personalInfo: defaultPersonalInfo,
          sections: [],
          isDirty: false,
          lastSaved: null,
        }),

      markSaved: () => set({ isDirty: false, lastSaved: new Date() }),
    }),
    {
      name: 'cvolt_draft',
      // Only persist data — not transient UI flags
      partialize: (state) => ({
        resumeId: state.resumeId,
        personalInfo: state.personalInfo,
        sections: state.sections,
      }),
    }
  )
)
