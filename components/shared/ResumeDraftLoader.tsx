"use client";

import { useEffect } from "react";
import { loadLatestDraft } from "@/lib/load-draft";
import { useResumeStore } from "@/store/resumeStore";
import { useUIStore } from "@/store/uiStore";

// Runs once per page load (root layout). The browser draft (localStorage
// "cvolt_draft") always wins; only when it is empty do we load the signed-in
// user's latest draft from Supabase. Sets uiStore.draftReady when done so
// forms mount with the right defaultValues.
export default function ResumeDraftLoader() {
  const setDraftReady = useUIStore((s) => s.setDraftReady);

  useEffect(() => {
    // Wait for the persisted draft to be read from localStorage first
    const run = () => {
      loadLatestDraft()
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
