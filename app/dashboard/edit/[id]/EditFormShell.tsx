"use client";

import { useEffect } from "react";
import { useResumeStore } from "@/store/resumeStore";
import StepWrapper from "@/components/build/StepWrapper";
import type { ResumeData } from "@/types";

interface EditFormShellProps {
  resumeId: string;
  resumeData: ResumeData;
}

export default function EditFormShell({
  resumeId,
  resumeData,
}: EditFormShellProps) {
  const store = useResumeStore();

  useEffect(() => {
    // Skip hydration if store already has this resume loaded
    if (store.resumeId === resumeId) return;
    store.hydrate(resumeData, resumeId);
  }, [resumeId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      {store.isDirty && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-800">
          Unsaved changes — complete all steps to save
        </div>
      )}
      <StepWrapper />
    </div>
  );
}
