"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { useUIStore } from "@/store/uiStore";
import { useResumeStore } from "@/store/resumeStore";
import { createClient } from "@/lib/supabase/client";
import { shapeDbRowToResumeData, type DbResume } from "@/lib/utils";
import BuildLoading from "./loading";

// SSR disabled — StepWrapper depends entirely on client-side Zustand state
// (uiStore.currentStep). SSR-ing it with stale singleton state causes hydration mismatches.
const StepWrapper = dynamic(() => import("@/components/build/StepWrapper"), {
  ssr: false,
  loading: () => <BuildLoading />,
});

function BuildInner() {
  const searchParams = useSearchParams();
  const { setStep } = useUIStore();
  const { resumeId, hydrate } = useResumeStore();

  // Hydrate store from Supabase when user is logged in
  useEffect(() => {
    async function loadFromDb() {
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
        .single();

      if (!resume) return;
      // Skip if this resume is already loaded in the store
      if (resumeId === resume.id) return;

      hydrate(shapeDbRowToResumeData(resume as DbResume), resume.id);
    }

    loadFromDb();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const step = Number(searchParams.get("step"));
    if (step >= 1 && step <= 4) setStep(step);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <StepWrapper />;
}

export default function BuildPage() {
  return (
    <Suspense>
      <BuildInner />
    </Suspense>
  );
}
