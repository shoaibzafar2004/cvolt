"use client";

import { forwardRef, useImperativeHandle } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { summarySchema, type SummaryFormData } from "@/lib/schemas";
import { useResumeStore } from "@/store/resumeStore";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import ClientOnlyTemplate from "@/components/resume-templates/ClientOnlyTemplate";
import type { StepSubmitRef } from "./StepWrapper";

const A4_WIDTH = 794;
const A4_HEIGHT = 1123;
const PREVIEW_SCALE = 0.42;
const PREVIEW_CONTAINER_WIDTH = Math.round(A4_WIDTH * PREVIEW_SCALE); // ~333px
const PREVIEW_CONTAINER_HEIGHT = Math.round(A4_HEIGHT * PREVIEW_SCALE); // ~472px

const MAX_CHARS = 500;

const Step4 = forwardRef<StepSubmitRef>((_, ref) => {
  const store = useResumeStore();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SummaryFormData>({
    resolver: zodResolver(summarySchema),
    defaultValues: { summary: store.personalInfo.summary ?? "" },
  });

  const summary = watch("summary") ?? "";

  useImperativeHandle(ref, () => ({
    submit: () => handleSubmit(onSubmit)(),
  }));

  async function onSubmit(data: SummaryFormData) {
    const merged = { ...store.personalInfo, summary: data.summary ?? "" };
    store.setPersonalInfo(merged);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user && store.resumeId) {
      await supabase
        .from("resumes")
        .update({ personal_info: merged, updated_at: new Date().toISOString() })
        .eq("id", store.resumeId);
    }

    router.push("/templates");
  }

  function handleSkip() {
    router.push("/templates");
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Optional — a 2–3 sentence snapshot of your career. You can skip this.
      </p>

      {/* Summary textarea */}
      <div className="space-y-2">
        <Textarea
          className="min-h-32 resize-y"
          placeholder="Results-driven software engineer with 5+ years of experience building scalable web applications..."
          spellCheck={true}
          {...register("summary", {
            onBlur: (e) =>
              store.setPersonalInfo({
                ...store.personalInfo,
                summary: e.target.value,
              }),
          })}
        />
        <div className="flex items-center justify-between">
          {errors.summary ? (
            <p className="text-sm text-destructive">{errors.summary.message}</p>
          ) : (
            <span />
          )}
          <span
            className={`text-xs ${summary.length > MAX_CHARS ? "text-destructive" : "text-muted-foreground"}`}
          >
            {summary.length} / {MAX_CHARS}
          </span>
        </div>
      </div>

      {/* Mini resume preview */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Resume preview</p>
        <div
          className="overflow-hidden rounded-lg border bg-white shadow-sm"
          style={{
            width: PREVIEW_CONTAINER_WIDTH,
            height: PREVIEW_CONTAINER_HEIGHT,
            position: "relative",
          }}
        >
          <div
            style={{
              width: A4_WIDTH,
              transformOrigin: "top left",
              transform: `scale(${PREVIEW_SCALE})`,
              position: "absolute",
              top: 0,
              left: 0,
              pointerEvents: "none",
              userSelect: "none",
            }}
          >
            <ClientOnlyTemplate
              slug="clean"
              data={{
                personalInfo: store.personalInfo,
                sections: store.sections,
              }}
            />
          </div>
        </div>
      </div>

      {/* Skip button */}
      <button
        type="button"
        onClick={handleSkip}
        className="text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground"
      >
        Skip — go to templates
      </button>
    </div>
  );
});

Step4.displayName = "Step4";
export default Step4;
