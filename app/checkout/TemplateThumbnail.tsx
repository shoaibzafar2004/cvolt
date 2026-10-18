'use client'

import { useResumeStore } from '@/store/resumeStore'
import ClientOnlyTemplate from '@/components/resume-templates/ClientOnlyTemplate'
import type { ResumeData } from '@/types'

const PLACEHOLDER: ResumeData = {
  personalInfo: {
    name: 'Alex Johnson',
    jobTitle: 'Senior Software Engineer',
    email: 'alex@example.com',
    phone: '+1 555 000 1234',
    location: 'San Francisco, CA',
  },
  sections: [
    {
      id: '1',
      type: 'work',
      displayOrder: 0,
      content: {
        company: 'Acme Corp',
        role: 'Senior Engineer',
        startDate: '2021-06',
        current: true,
        bullets: ['Led migration to microservices', 'Reduced API latency by 40%'],
      },
    },
    {
      id: '2',
      type: 'education',
      displayOrder: 1,
      content: {
        institution: 'MIT',
        degree: 'BSc',
        field: 'Computer Science',
        startDate: '2013-09',
        endDate: '2017-05',
      },
    },
    {
      id: '3',
      type: 'skills',
      displayOrder: 2,
      content: {
        skills: [
          { name: 'TypeScript', level: 'Expert' },
          { name: 'React', level: 'Expert' },
          { name: 'Node.js', level: 'Advanced' },
        ],
      },
    },
  ],
}

const A4_WIDTH = 794
const SCALE = 0.1 // tiny — fits in a 80×80 thumbnail

export default function TemplateThumbnail({ slug }: { slug: string }) {
  const store = useResumeStore()
  const data = store.personalInfo.name
    ? { personalInfo: store.personalInfo, sections: store.sections }
    : PLACEHOLDER

  return (
    <div
      style={{
        width: 80,
        height: 113, // A4 aspect ratio at 80px wide
        overflow: 'hidden',
        flexShrink: 0,
        position: 'relative',
        borderRadius: 4,
      }}
    >
      <div
        style={{
          width: A4_WIDTH,
          transformOrigin: 'top left',
          transform: `scale(${SCALE})`,
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none',
        }}
      >
        <ClientOnlyTemplate slug={slug} data={data} />
      </div>
    </div>
  )
}
