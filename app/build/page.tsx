"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { useUIStore } from "@/store/uiStore";
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

  useEffect(() => {
    const step = Number(searchParams.get("step"));
    if (step >= 1 && step <= TOTAL_STEPS) setStep(step);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return draftReady ? <StepWrapper /> : <BuildLoading />;
}

export default function BuildPage() {
  return (
    <Suspense>
      <BuildInner />
    </Suspense>
  );
}
