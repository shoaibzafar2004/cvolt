"use client";

import { useEffect } from "react";
import { useResumeStore } from "@/store/resumeStore";
import { useUIStore } from "@/store/uiStore";
import StepWrapper from "@/components/build/StepWrapper";
import BuildLoading from "@/app/build/loading";
import type { ResumeData } from "@/types";

interface EditFormShellProps {
  resumeId: string;
  /** The purchase this resume belongs to — finishing goes to its download page */
  paymentId: string;
  resumeData: ResumeData;
}

export default function EditFormShell({
  resumeId,
  paymentId,
  resumeData,
}: EditFormShellProps) {
  const storeResumeId = useResumeStore((s) => s.resumeId);
  const isDirty = useResumeStore((s) => s.isDirty);
  const draftReady = useUIStore((s) => s.draftReady);
  const setStep = useUIStore((s) => s.setStep);
  const loaded = storeResumeId === resumeId;

  useEffect(() => {
    // Wait for the persisted draft first, so it can't overwrite this resume
    if (!draftReady) return;
    const {
      resumeId: current,
      purchaseId,
      hydrate,
    } = useResumeStore.getState();
    // Keep unsaved local edits to this same purchase
    if (current === resumeId && purchaseId === paymentId) return;
    hydrate(resumeData, resumeId, paymentId);
    setStep(1);
  }, [draftReady, resumeId, paymentId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Each step's form reads defaultValues once on mount — only mount them
  // after this resume is in the store
  if (!loaded) return <BuildLoading />;

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
