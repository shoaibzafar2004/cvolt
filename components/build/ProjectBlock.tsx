"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Controller } from "react-hook-form";
import type {
  UseFormRegister,
  UseFieldArrayRemove,
  FieldErrors,
  Control,
} from "react-hook-form";
import type { Step3FormData } from "@/lib/schemas";
import type { ProjectKind } from "@/types";
import { Input } from "@/components/ui/input";
import { MonthPicker } from "@/components/ui/month-picker";
import { Button } from "@/components/ui/button";
import BulletEditor from "./BulletEditor";
import TagInput from "./TagInput";
import { GripVertical, Trash2 } from "lucide-react";

const KIND_OPTIONS: { value: ProjectKind; label: string }[] = [
  { value: "project", label: "Personal project" },
  { value: "contribution", label: "Open-source contribution" },
];

interface ProjectBlockProps {
  index: number;
  id: string;
  register: UseFormRegister<Step3FormData>;
  control: Control<Step3FormData>;
  remove: UseFieldArrayRemove;
  errors: FieldErrors<Step3FormData>;
  watchKind: ProjectKind;
  watchCurrent: boolean;
  watchName: string;
}

export default function ProjectBlock({
  index,
  id,
  register,
  control,
  remove,
  errors,
  watchKind,
  watchCurrent,
  watchName,
}: ProjectBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const fieldErrors = errors.projects?.[index];
  const isContribution = watchKind === "contribution";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="space-y-4 rounded-2xl border bg-muted/30 p-5"
    >
      {/* Header row */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="cursor-grab text-muted-foreground active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <span className="flex-1 text-sm font-medium">
          {watchName || `Project ${index + 1}`}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => remove(index)}
          className="text-destructive hover:text-destructive"
          aria-label="Remove project"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Kind */}
      <Controller
        control={control}
        name={`projects.${index}.kind`}
        render={({ field }) => (
          <div
            role="radiogroup"
            aria-label="Entry type"
            className="inline-flex rounded-full border bg-background p-1"
          >
            {KIND_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={field.value === opt.value}
                onClick={() => field.onChange(opt.value)}
                className={[
                  "rounded-full px-4 py-1.5 text-sm transition-colors",
                  field.value === opt.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="mb-2 block pl-4.5 text-sm font-medium">
            {isContribution ? "Project / repository" : "Project name"}
          </label>
          <Input
            placeholder={isContribution ? "vercel/next.js" : "Cvolt"}
            spellCheck={false}
            aria-invalid={!!fieldErrors?.name || undefined}
            {...register(`projects.${index}.name`)}
          />
          {fieldErrors?.name && (
            <p className="text-sm text-destructive">
              {fieldErrors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label className="mb-2 block pl-4.5 text-sm font-medium">
            Your role
            <span className="ml-1 font-normal text-muted-foreground">
              (optional)
            </span>
          </label>
          <Input
            placeholder={isContribution ? "Contributor" : "Creator"}
            spellCheck={true}
            {...register(`projects.${index}.role`)}
          />
        </div>

        <div className="space-y-1 sm:col-span-2">
          <label className="mb-2 block pl-4.5 text-sm font-medium">
            Link
            <span className="ml-1 font-normal text-muted-foreground">
              (optional)
            </span>
          </label>
          <Input
            placeholder={
              isContribution
                ? "https://github.com/org/repo/pulls?q=author:you"
                : "https://github.com/you/project"
            }
            spellCheck={false}
            aria-invalid={!!fieldErrors?.url || undefined}
            {...register(`projects.${index}.url`)}
          />
          {fieldErrors?.url && (
            <p className="text-sm text-destructive">
              {fieldErrors.url.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label className="mb-2 block pl-4.5 text-sm font-medium">
            Start date
            <span className="ml-1 font-normal text-muted-foreground">
              (optional)
            </span>
          </label>
          <Controller
            control={control}
            name={`projects.${index}.startDate`}
            render={({ field }) => (
              <MonthPicker
                value={field.value ?? ""}
                onChange={field.onChange}
                placeholder="Select start date"
              />
            )}
          />
        </div>

        <div className="space-y-1">
          <label className="mb-2 block pl-4.5 text-sm font-medium">
            End date
          </label>
          <Controller
            control={control}
            name={`projects.${index}.endDate`}
            render={({ field }) => (
              <MonthPicker
                value={field.value ?? ""}
                onChange={field.onChange}
                placeholder="Select end date"
                disabled={watchCurrent}
              />
            )}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id={`current-${id}`}
          className="rounded"
          {...register(`projects.${index}.current`)}
        />
        <label htmlFor={`current-${id}`} className="text-sm">
          Ongoing
        </label>
      </div>

      <div className="space-y-1">
        <label className="mb-2 block pl-4.5 text-sm font-medium">
          Short description
          <span className="ml-1 font-normal text-muted-foreground">
            (optional)
          </span>
        </label>
        <Input
          placeholder={
            isContribution
              ? "React framework for production web apps"
              : "One-time-pay resume builder with live template previews"
          }
          spellCheck={true}
          {...register(`projects.${index}.description`)}
        />
      </div>

      <div className="space-y-1">
        <label className="mb-2 block pl-4.5 text-sm font-medium">
          {isContribution ? "What you contributed" : "Key highlights"}
        </label>
        <Controller
          control={control}
          name={`projects.${index}.bullets`}
          render={({ field }) => (
            <BulletEditor value={field.value} onChange={field.onChange} />
          )}
        />
      </div>

      <Controller
        control={control}
        name={`projects.${index}.techStack`}
        render={({ field }) => (
          <TagInput
            label="Tech stack"
            placeholder="e.g. Next.js, Supabase, Stripe"
            value={field.value ?? []}
            onChange={field.onChange}
          />
        )}
      />
    </div>
  );
}
