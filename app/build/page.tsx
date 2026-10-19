"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { useUIStore } from "@/store/uiStore";
import { useResumeStore } from "@/store/resumeStore";
import { loadLatestDraft } from "@/lib/load-draft";
import BuildLoading from "./loading";
import { TOTAL_STEPS } from "@/lib/build-steps";

// SSR disabled — StepWrapper depends entirely on client-side Zustand state
// (uiStore.currentStep). SSR-ing it with stale singleton state causes hydration mismatches.
const StepWrapper = dynamic(() => import("@/components/build/StepWrapper"), {
  ssr: false,
  loading: () => <BuildLoading />,
});

function BuildInner() {
  const searchParams = useSearchParams();
  const setStep = useUIStore((s) => s.setStep);
  // Draft comes from localStorage, or the DB when that's empty (ResumeDraftLoader).
  // Wait for it so each step's form mounts with the right defaultValues.
  const draftReady = useUIStore((s) => s.draftReady);
  const setDraftReady = useUIStore((s) => s.setDraftReady);
  const purchaseId = useResumeStore((s) => s.purchaseId);
  const router = useRouter();
  const startNew = searchParams.get("new") === "1";

  useEffect(() => {
    const step = Number(searchParams.get("step"));
    if (step >= 1 && step <= TOTAL_STEPS) setStep(step);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // "New resume" (?new=1): start from an empty draft. Drop the param so a
  // reload doesn't wipe the new draft again.
  useEffect(() => {
    if (!draftReady || !startNew) return;
    useResumeStore.getState().reset();
    setStep(1);
    router.replace("/build");
  }, [draftReady, startNew, setStep, router]);

  // /build edits drafts only. A purchased resume left in the store (from
  // /dashboard/edit) is swapped for the user's latest draft.
  useEffect(() => {
    if (!draftReady || !purchaseId || startNew) return;
    setDraftReady(false);
    useResumeStore.getState().reset();
    loadLatestDraft()
      .catch(() => {})
      .finally(() => setDraftReady(true));
  }, [draftReady, purchaseId, startNew, setDraftReady]);

  return draftReady && !purchaseId && !startNew ? (
    <StepWrapper />
  ) : (
    <BuildLoading />
  );
}

export default function BuildPage() {
  return (
    <Suspense>
      <BuildInner />
    </Suspense>
  );
}
