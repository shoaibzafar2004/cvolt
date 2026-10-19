"use client";

import { useEffect, useState } from "react";
import { useResumeStore } from "@/store/resumeStore";
import { useUIStore } from "@/store/uiStore";
import StepWrapper from "@/components/build/StepWrapper";
import BuildLoading from "@/app/build/loading";
import type { ResumeData } from "@/types";

interface EditFormShellProps {
  resumeId: string;
  /** The purchase this resume belongs to — finishing goes to its download page */
  paymentId: string;
  /** That purchase's template — free re-edits always render with it */
  templateId: string;
  resumeData: ResumeData;
}

export default function EditFormShell({
  resumeId,
  paymentId,
  templateId,
  resumeData,
}: EditFormShellProps) {
  const isDirty = useResumeStore((s) => s.isDirty);
  const hydrateCount = useResumeStore((s) => s.hydrateCount);
  // Count at first render; the forms mount only after our own hydrate below
  const [startCount] = useState(() => useResumeStore.getState().hydrateCount);
  const draftReady = useUIStore((s) => s.draftReady);
  const setStep = useUIStore((s) => s.setStep);

  useEffect(() => {
    // Wait for the persisted draft first, so it can't overwrite this resume.
    // Always load from the server: the browser copy may be stale (e.g. this
    // purchase was reverted after its edits were bought as a new resume).
    if (!draftReady) return;
    useResumeStore
      .getState()
      .hydrate(resumeData, resumeId, { paymentId, templateId });
    setStep(1);
  }, [draftReady, resumeId, paymentId, templateId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Each step's form reads defaultValues once on mount
  if (hydrateCount <= startCount) return <BuildLoading />;

  return (
    <div>
      {isDirty && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-800">
          Unsaved changes — complete all steps to save
        </div>
      )}
      <StepWrapper
        finish={{
          href: `/dashboard/download/${paymentId}`,
          label: "Save & get PDF",
        }}
      />
    </div>
  );
}
