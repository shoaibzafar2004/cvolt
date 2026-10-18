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
import type { Step2FormData } from "@/lib/schemas";
import { Input } from "@/components/ui/input";
import { MonthPicker } from "@/components/ui/month-picker";
import { Button } from "@/components/ui/button";
import BulletEditor from "./BulletEditor";
import { GripVertical, Trash2 } from "lucide-react";
import TagInput from "./TagInput";

interface WorkBlockProps {
  index: number;
  id: string;
  register: UseFormRegister<Step2FormData>;
  control: Control<Step2FormData>;
  remove: UseFieldArrayRemove;
  errors: FieldErrors<Step2FormData>;
  watchCurrent: boolean;
  watchRole: string;
  watchCompany: string;
}

export default function WorkBlock({
  index,
  id,
  register,
  control,
  remove,
  errors,
  watchCurrent,
  watchRole,
  watchCompany,
}: WorkBlockProps) {
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

  const fieldErrors = errors.workEntries?.[index];

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
          {watchRole && watchCompany
            ? `${watchRole} at ${watchCompany}`
            : watchRole || watchCompany || `Experience ${index + 1}`}
        </span>
        {index > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => remove(index)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="mb-2 block pl-4.5 text-sm font-medium">
            Company
          </label>
          <Input
            placeholder="Acme Corp"
            spellCheck={false}
            aria-invalid={!!fieldErrors?.company || undefined}
            {...register(`workEntries.${index}.company`)}
          />
          {fieldErrors?.company && (
            <p className="text-sm text-destructive">
              {fieldErrors.company.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label className="mb-2 block pl-4.5 text-sm font-medium">Role</label>
          <Input
            placeholder="Software Engineer"
            spellCheck={true}
            aria-invalid={!!fieldErrors?.role || undefined}
            {...register(`workEntries.${index}.role`)}
          />
          {fieldErrors?.role && (
            <p className="text-sm text-destructive">
              {fieldErrors.role.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label className="mb-2 block pl-4.5 text-sm font-medium">
            Start date
          </label>
          <Controller
            control={control}
            name={`workEntries.${index}.startDate`}
            render={({ field }) => (
              <MonthPicker
                value={field.value}
                onChange={field.onChange}
                placeholder="Select start date"
                aria-invalid={!!fieldErrors?.startDate || undefined}
              />
            )}
          />
          {fieldErrors?.startDate && (
            <p className="text-sm text-destructive">
              {fieldErrors.startDate.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label className="mb-2 block pl-4.5 text-sm font-medium">
            End date
          </label>
          <Controller
            control={control}
            name={`workEntries.${index}.endDate`}
            render={({ field }) => (
              <MonthPicker
                value={field.value}
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
          {...register(`workEntries.${index}.current`)}
        />
        <label htmlFor={`current-${id}`} className="text-sm">
          I currently work here
        </label>
      </div>

      <div className="space-y-1">
        <label className="mb-2 block pl-4.5 text-sm font-medium">
          Key achievements / responsibilities
        </label>
        <Controller
          control={control}
          name={`workEntries.${index}.bullets`}
          render={({ field }) => (
            <BulletEditor value={field.value} onChange={field.onChange} />
          )}
        />
      </div>

      {/* Skills used at this job */}
      <Controller
        control={control}
        name={`workEntries.${index}.skills`}
        render={({ field }) => (
          <TagInput
            label="Technologies / tools used"
            placeholder="e.g. React, Node.js, PostgreSQL"
            value={field.value ?? []}
            onChange={field.onChange}
          />
        )}
      />
    </div>
  );
}
