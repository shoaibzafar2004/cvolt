import { createClient } from "@/lib/supabase/client";
import { shapeDbRowToResumeData, type DbResume } from "@/lib/utils";
import { useResumeStore } from "@/store/resumeStore";

function hasDraft(): boolean {
  const { resumeId, personalInfo, sections } = useResumeStore.getState();
  return Boolean(resumeId || personalInfo.name || sections.length);
}

/**
 * When the store is empty and the user is signed in, load their most recently
 * updated draft (not a purchased resume) from Supabase. Never overwrites a
 * resume already in the store — browser state always wins.
 */
export async function loadLatestDraft(): Promise<void> {
  if (hasDraft()) return;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: resume } = await supabase
    .from("resumes")
    .select(
      "id, personal_info, resume_sections(id, section_type, content, display_order)",
    )
    .eq("user_id", user.id)
    .eq("purchased", false)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Re-check: a page (e.g. /dashboard/edit/[id]) may have hydrated meanwhile
  if (!resume || hasDraft()) return;
  useResumeStore
    .getState()
    .hydrate(shapeDbRowToResumeData(resume as DbResume), resume.id);
}
