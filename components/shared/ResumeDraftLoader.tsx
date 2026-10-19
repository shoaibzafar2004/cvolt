"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { shapeDbRowToResumeData, type DbResume } from "@/lib/utils";
import { useResumeStore } from "@/store/resumeStore";
import { useUIStore } from "@/store/uiStore";

function hasDraft(): boolean {
  const { resumeId, personalInfo, sections } = useResumeStore.getState();
  return Boolean(resumeId || personalInfo.name || sections.length);
}

// Runs once per page load (root layout). The browser draft (localStorage
// "cvolt_draft") always wins; only when it is empty do we load the signed-in
// user's most recently updated resume from Supabase. Sets uiStore.draftReady
// when done so forms mount with the right defaultValues.
export default function ResumeDraftLoader() {
  const setDraftReady = useUIStore((s) => s.setDraftReady);

  useEffect(() => {
    async function load() {
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
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      // Re-check: a page (e.g. /dashboard/edit/[id]) may have hydrated meanwhile
      if (!resume || hasDraft()) return;
      useResumeStore
        .getState()
        .hydrate(shapeDbRowToResumeData(resume as DbResume), resume.id);
    }

    // Wait for the persisted draft to be read from localStorage first
    const run = () => {
      load()
        .catch(() => {})
        .finally(() => setDraftReady(true));
    };
    if (useResumeStore.persist.hasHydrated()) {
      run();
      return;
    }
    return useResumeStore.persist.onFinishHydration(run);
  }, [setDraftReady]);

  return null;
}
