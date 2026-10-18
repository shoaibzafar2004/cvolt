import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { shapeDbRowToResumeData, type DbResume } from '@/lib/utils'
import EditFormShell from './EditFormShell'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?returnTo=/dashboard')

  // Fetch resume that belongs to this user
  const { data: resume } = await supabase
    .from('resumes')
    .select(`
      id,
      personal_info,
      resume_sections ( id, section_type, content, display_order )
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!resume) notFound()

  const resumeData = shapeDbRowToResumeData(resume as DbResume)

  return <EditFormShell resumeId={resume.id} resumeData={resumeData} />
}
