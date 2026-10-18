"use client";

import { useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useUIStore } from "@/store/uiStore";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check, LayoutTemplate } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import SectionLine from "@/components/shared/SectionLine";
import { BUILD_STEPS, TOTAL_STEPS } from "@/lib/build-steps";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import Step4 from "./Step4";
import Step5 from "./Step5";

export type StepSubmitRef = { submit: () => void };

export default function StepWrapper() {
  const { currentStep, setStep } = useUIStore();
  const stepRef = useRef<StepSubmitRef>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  const returnTo = searchParams.get("returnTo");

  const handleNext = () => stepRef.current?.submit();
  const handleBack = () => setStep(currentStep - 1);

  return (
    <div className="flex flex-1 overflow-hidden bg-muted/30">
      {/* ── Left — floating steps, no panel ─────────────────── */}
      <div className="relative hidden w-64 shrink-0 flex-col py-12 lg:flex xl:w-88">
        {/* Section line */}
        <SectionLine className="top-12 bottom-12 left-8" />

        {/* Steps */}
        <div className="mt-4 flex flex-col gap-18 pr-4 pl-22">
          {BUILD_STEPS.map(({ step, label, sublabel, icon: Icon }) => {
            const isComplete = currentStep > step;
            const isActive = currentStep === step;
            const isPending = currentStep < step;

            return (
              <button
                key={step}
                type="button"
                disabled={!isComplete}
                onClick={() => isComplete && setStep(step)}
                className="group flex items-center gap-3 text-left disabled:cursor-default"
              >
                {/* Icon circle */}
                <div
                  className={[
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200",
                    isComplete &&
                      "border-foreground bg-foreground text-background group-hover:opacity-75",
                    isActive &&
                      "border-foreground bg-background text-foreground shadow-sm",
                    isPending &&
                      "border-border bg-background/60 text-muted-foreground",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {isComplete ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>

                {/* Short connector */}
                <div
                  className={[
                    "h-px w-4 shrink-0 transition-colors",
                    isComplete || isActive ? "bg-foreground/25" : "bg-border",
                  ].join(" ")}
                />

                {/* Labels */}
                <div>
                  <p
                    className={[
                      "text-sm leading-tight font-semibold",
                      isPending ? "text-muted-foreground" : "text-foreground",
                    ].join(" ")}
                  >
                    {label}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {sublabel}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Right — form + nav ───────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Mobile top strip */}
        <div className="flex shrink-0 items-center gap-3 border-b bg-background px-4 py-3 lg:hidden">
          {currentStep > 1 && (
            <button
              onClick={handleBack}
              className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
            {currentStep}/{TOTAL_STEPS}
          </span>
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-foreground transition-all duration-300"
              style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
            />
          </div>
          <span className="shrink-0 text-xs font-medium text-foreground">
            {BUILD_STEPS[currentStep - 1].label}
          </span>
        </div>

        {/* Scrollable form — card fills the column */}
        <div className="flex-1 overflow-auto px-4 pt-8 pb-4 lg:px-8 xl:px-12">
          <h2 className="mt-8 mb-4 px-1 text-xl font-semibold">
            {BUILD_STEPS[currentStep - 1].label}
          </h2>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18, ease: "easeInOut" }}
              className={
                currentStep === 2 || currentStep === 3 || currentStep === 4
                  ? ""
                  : "rounded-2xl border bg-background p-6 shadow-sm lg:p-10"
              }
            >
              {currentStep === 1 && <Step1 ref={stepRef} />}
              {currentStep === 2 && <Step2 ref={stepRef} />}
              {currentStep === 3 && <Step3 ref={stepRef} />}
              {currentStep === 4 && <Step4 ref={stepRef} />}
              {currentStep === 5 && <Step5 ref={stepRef} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation — outside the card, Back left · Next right */}
        <div className="flex shrink-0 items-center justify-between px-4 py-5 lg:px-8 xl:px-12">
          {currentStep > 1 ? (
            <Button
              variant="outline"
              size="lg"
              onClick={handleBack}
              className="rounded-full"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          ) : (
            <div />
          )}
          <Button
            size="lg"
            onClick={
              currentStep === TOTAL_STEPS
                ? () => router.push(returnTo ?? "/templates")
                : handleNext
            }
            className="rounded-full"
          >
            {currentStep === TOTAL_STEPS ? (
              <>
                <LayoutTemplate className="h-4 w-4" />{" "}
                {returnTo ? "Back to preview" : "Browse templates"}
              </>
            ) : (
              <>
                Next <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
