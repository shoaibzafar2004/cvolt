"use client";

import { forwardRef, useImperativeHandle } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { step3Schema, type Step3FormData } from "@/lib/schemas";
import { useResumeStore } from "@/store/resumeStore";
import { useUIStore } from "@/store/uiStore";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { FolderGit2, Plus } from "lucide-react";
import ProjectBlock from "./ProjectBlock";
import type { StepSubmitRef } from "./StepWrapper";
import { v4 as uuidv4 } from "uuid";
import type { ProjectContent } from "@/types";

type ProjectEntry = Step3FormData["projects"][number];

function buildDefaultEntry(): ProjectEntry {
  return {
    id: uuidv4(),
    name: "",
    kind: "project",
    role: "",
    url: "",
    description: "",
    techStack: [],
    startDate: "",
    endDate: "",
    current: false,
    bullets: [""],
  };
}

// Form entry → stored content. Empty optional fields are dropped so templates can use simple truthy checks.
function toContent(entry: ProjectEntry): ProjectContent {
  return {
    name: entry.name,
    kind: entry.kind,
    role: entry.role || undefined,
    url: entry.url || undefined,
    description: entry.description || undefined,
    techStack: entry.techStack,
    startDate: entry.startDate || undefined,
    endDate: entry.current ? undefined : entry.endDate || undefined,
    current: entry.current,
    bullets: entry.bullets.filter(Boolean),
  };
}

const Step3 = forwardRef<StepSubmitRef>((_, ref) => {
  const store = useResumeStore();
  const { setStep } = useUIStore();

  const existingSection = store.sections.find((s) => s.type === "projects");
  // Older entries (from the Step-4 toggle) lack kind/techStack/dates — fill defaults.
  const existingProjects: ProjectEntry[] = (
    (existingSection?.content as ProjectContent[] | undefined) ?? []
  ).map((p) => ({
    ...buildDefaultEntry(),
    name: p.name,
    kind: p.kind ?? "project",
    role: p.role ?? "",
    url: p.url ?? "",
    description: p.description ?? "",
    techStack: p.techStack ?? [],
    startDate: p.startDate ?? "",
    endDate: p.endDate ?? "",
    current: p.current ?? false,
    bullets: p.bullets.length ? p.bullets : [""],
  }));

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Step3FormData>({
    resolver: zodResolver(step3Schema),
    defaultValues: { projects: existingProjects },
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "projects",
  });

  const watchedEntries = useWatch({ control, name: "projects" });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  async function onSubmit(data: Step3FormData) {
    // All projects live in ONE section with array content (same as before this step existed).
    const sectionId = existingSection?.id ?? uuidv4();
    const content = data.projects.map(toContent);

    if (existingSection) store.removeSection(existingSection.id);
    if (content.length > 0) {
      store.upsertSection({
        id: sectionId,
        type: "projects",
        content,
        displayOrder: 0,
      });
    }

    if (store.resumeId) {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("resume_sections")
          .delete()
          .eq("resume_id", store.resumeId)
          .eq("section_type", "projects");
        if (content.length > 0) {
          await supabase.from("resume_sections").insert({
            id: sectionId,
            resume_id: store.resumeId,
            section_type: "projects",
            content,
            display_order: 0,
          });
        }
        store.markSaved();
      }
    }

    setStep(4);
  }

  useImperativeHandle(ref, () => ({
    submit: () => handleSubmit(onSubmit)(),
  }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);
      move(oldIndex, newIndex);
    }
  }

  return (
    <div className="space-y-5">
      {fields.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed bg-muted/20 px-6 py-10 text-center">
          <FolderGit2 className="h-8 w-8 text-muted-foreground" />
          <p className="font-medium">No projects yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Side projects and open-source contributions show what you build on
            your own. This step is optional — click Next to skip it.
          </p>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={fields.map((f) => f.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {fields.map((field, index) => (
              <ProjectBlock
                key={field.id}
                id={field.id}
                index={index}
                register={register}
                control={control}
                remove={remove}
                errors={errors}
                watchKind={watchedEntries?.[index]?.kind ?? "project"}
                watchCurrent={watchedEntries?.[index]?.current ?? false}
                watchName={watchedEntries?.[index]?.name ?? ""}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Button
        type="button"
        variant="outline"
        className="h-12 w-full gap-2 border-dashed text-sm"
        onClick={() => append(buildDefaultEntry())}
      >
        <Plus className="h-4 w-4" /> Add project or contribution
      </Button>
    </div>
  );
});

Step3.displayName = "Step3";
export default Step3;
