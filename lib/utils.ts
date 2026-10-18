import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { ResumeData, Section, SectionType } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface DbResume {
  personal_info: ResumeData['personalInfo']
  resume_sections: Array<{
    id: string
    section_type: string
    content: Section['content']
    display_order: number
  }>
}

// Single source of truth for mapping DB rows → ResumeData.
// Used by the edit flow and download gate.
export function shapeDbRowToResumeData(row: DbResume): ResumeData {
  return {
    personalInfo: row.personal_info,
    sections: (row.resume_sections ?? [])
      .sort((a, b) => a.display_order - b.display_order)
      .map((s) => ({
        id: s.id,
        type: s.section_type as SectionType,
        content: s.content,
        displayOrder: s.display_order,
      })),
  }
}

const MS_PER_DAY = 1000 * 60 * 60 * 24

// Whole days from now until `date`, rounded up. Zero or negative once it has passed.
export function daysUntil(date: string | Date): number {
  return Math.ceil((new Date(date).getTime() - Date.now()) / MS_PER_DAY)
}
