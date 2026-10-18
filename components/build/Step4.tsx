"use client";

import React, { forwardRef, useImperativeHandle, useState } from "react";
import { useForm, useFieldArray, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { step4Schema, type Step4FormData } from "@/lib/schemas";
import { useResumeStore } from "@/store/resumeStore";
import { useUIStore } from "@/store/uiStore";
import { Input } from "@/components/ui/input";
import { MonthPicker } from "@/components/ui/month-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus as PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Award, Globe, Check } from "lucide-react";
import type { StepSubmitRef } from "./StepWrapper";
import type {
  EducationContent,
  SkillsContent,
  CertificationContent,
  LanguageContent,
} from "@/types";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "@/lib/supabase/client";

type ToggleKey = "certifications" | "languages";

const Step4 = forwardRef<StepSubmitRef>((_, ref) => {
  const store = useResumeStore();
  const { setStep } = useUIStore();

  const existingEducation = store.sections
    .filter((s) => s.type === "education")
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((s) => {
      const c = s.content as EducationContent;
      return {
        id: s.id,
        institution: c.institution,
        degree: c.degree,
        field: c.field,
        startDate: c.startDate,
        endDate: c.endDate ?? "",
        gpa: c.gpa ?? "",
      };
    });

  const existingSkills = store.sections.find((s) => s.type === "skills");
  const initialSkills = existingSkills
    ? (existingSkills.content as SkillsContent).skills
    : [];

  const [toggles, setToggles] = useState<Record<ToggleKey, boolean>>({
    certifications: store.sections.some((s) => s.type === "certifications"),
    languages: store.sections.some((s) => s.type === "languages"),
  });
  const [skillInput, setSkillInput] = useState("");
  const [skillLevel, setSkillLevel] = useState<
    "Beginner" | "Intermediate" | "Advanced" | "Expert"
  >("Intermediate");

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<Step4FormData>({
    resolver: zodResolver(step4Schema),
    defaultValues: {
      education: existingEducation.length
        ? existingEducation
        : [
            {
              id: uuidv4(),
              institution: "",
              degree: "",
              field: "",
              startDate: "",
              endDate: "",
              gpa: "",
            },
          ],
      skills: initialSkills,
      certifications:
        (store.sections.find((s) => s.type === "certifications")?.content as
          (CertificationContent & { id: string })[] | undefined) ?? [],
      languages:
        (store.sections.find((s) => s.type === "languages")?.content as
          (LanguageContent & { id: string })[] | undefined) ?? [],
    },
  });

  const {
    fields: eduFields,
    append: appendEdu,
    remove: removeEdu,
  } = useFieldArray({ control, name: "education" });
  const {
    fields: certFields,
    append: appendCert,
    remove: removeCert,
  } = useFieldArray({ control, name: "certifications" });
  const {
    fields: langFields,
    append: appendLang,
    remove: removeLang,
  } = useFieldArray({ control, name: "languages" });

  const skills = useWatch({ control, name: "skills" }) ?? [];
  const watchedEducation = useWatch({ control, name: "education" }) ?? [];

  function addSkill() {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.find((s: { name: string }) => s.name === trimmed)) {
      setValue("skills", [...skills, { name: trimmed, level: skillLevel }]);
      setSkillInput("");
    }
  }

  function removeSkill(name: string) {
    setValue(
      "skills",
      skills.filter((s: { name: string }) => s.name !== name),
    );
  }

  async function onSubmit(data: Step4FormData) {
    // Clear existing education/skills/optional sections
    ["education", "skills", "certifications", "languages"].forEach((type) => {
      store.sections
        .filter((s) => s.type === type)
        .forEach((s) => store.removeSection(s.id));
    });

    // Education
    data.education.forEach((entry, i) => {
      const content: EducationContent = {
        institution: entry.institution,
        degree: entry.degree,
        field: entry.field,
        startDate: entry.startDate,
        endDate: entry.endDate,
        gpa: entry.gpa,
      };
      store.upsertSection({
        id: entry.id,
        type: "education",
        content,
        displayOrder: i,
      });
    });

    // Skills
    const skillsId =
      store.sections.find((s) => s.type === "skills")?.id ?? uuidv4();
    const skillsContent: SkillsContent = { skills: data.skills };
    store.upsertSection({
      id: skillsId,
      type: "skills",
      content: skillsContent,
      displayOrder: 0,
    });

    // Optional sections — each stored as ONE section with array content
    const certId =
      store.sections.find((s) => s.type === "certifications")?.id ?? uuidv4();
    if (toggles.certifications && data.certifications?.length) {
      const content: CertificationContent[] = data.certifications.map((c) => ({
        name: c.name,
        issuer: c.issuer,
        date: c.date,
      }));
      store.upsertSection({
        id: certId,
        type: "certifications",
        content,
        displayOrder: 0,
      });
    }
    const langId =
      store.sections.find((s) => s.type === "languages")?.id ?? uuidv4();
    if (toggles.languages && data.languages?.length) {
      const content: LanguageContent[] = data.languages.map((l) => ({
        language: l.language,
        proficiency: l.proficiency,
      }));
      store.upsertSection({
        id: langId,
        type: "languages",
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
        const sectionTypes = [
          "education",
          "skills",
          "certifications",
          "languages",
        ];
        await supabase
          .from("resume_sections")
          .delete()
          .eq("resume_id", store.resumeId)
          .in("section_type", sectionTypes);

        const rows: {
          id: string;
          resume_id: string;
          section_type: string;
          content: unknown;
          display_order: number;
        }[] = [];

        data.education.forEach((entry, i) => {
          rows.push({
            id: entry.id,
            resume_id: store.resumeId!,
            section_type: "education",
            content: {
              institution: entry.institution,
              degree: entry.degree,
              field: entry.field,
              startDate: entry.startDate,
              endDate: entry.endDate,
              gpa: entry.gpa,
            },
            display_order: i,
          });
        });

        rows.push({
          id: skillsId,
          resume_id: store.resumeId!,
          section_type: "skills",
          content: { skills: data.skills },
          display_order: 0,
        });

        if (toggles.certifications && data.certifications?.length) {
          rows.push({
            id: certId,
            resume_id: store.resumeId!,
            section_type: "certifications",
            content: data.certifications.map((c) => ({
              name: c.name,
              issuer: c.issuer,
              date: c.date,
            })),
            display_order: 0,
          });
        }

        if (toggles.languages && data.languages?.length) {
          rows.push({
            id: langId,
            resume_id: store.resumeId!,
            section_type: "languages",
            content: data.languages.map((l) => ({
              language: l.language,
              proficiency: l.proficiency,
            })),
            display_order: 0,
          });
        }

        if (rows.length > 0)
          await supabase.from("resume_sections").insert(rows);
        store.markSaved();
      }
    }

    setStep(5);
  }

  useImperativeHandle(ref, () => ({
    submit: () => handleSubmit(onSubmit)(),
  }));

  return (
    <div className="space-y-8">
      {/* Education */}
      <section className="space-y-4">
        <h3 className="font-medium">Education</h3>
        {eduFields.map((field, index) => (
          <div
            key={field.id}
            className="space-y-4 rounded-lg border bg-card p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {(() => {
                  const deg = watchedEducation?.[index]?.degree;
                  const inst = watchedEducation?.[index]?.institution;
                  return deg && inst
                    ? `${deg} at ${inst}`
                    : deg || inst || `Education ${index + 1}`;
                })()}
              </span>
              {eduFields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeEdu(index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1 sm:col-span-2">
                <label className="mb-2 block pl-4.5 text-sm font-medium">
                  Institution
                </label>
                <Input
                  placeholder="MIT"
                  aria-invalid={
                    !!errors.education?.[index]?.institution || undefined
                  }
                  {...register(`education.${index}.institution`)}
                />
                {errors.education?.[index]?.institution && (
                  <p className="text-sm text-destructive">
                    {errors.education[index].institution.message}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <label className="mb-2 block pl-4.5 text-sm font-medium">
                  Degree
                </label>
                <Input
                  placeholder="Bachelor of Science"
                  aria-invalid={
                    !!errors.education?.[index]?.degree || undefined
                  }
                  {...register(`education.${index}.degree`)}
                />
                {errors.education?.[index]?.degree && (
                  <p className="text-sm text-destructive">
                    {errors.education[index].degree.message}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <label className="mb-2 block pl-4.5 text-sm font-medium">
                  Field of study
                </label>
                <Input
                  placeholder="Computer Science"
                  aria-invalid={!!errors.education?.[index]?.field || undefined}
                  {...register(`education.${index}.field`)}
                />
                {errors.education?.[index]?.field && (
                  <p className="text-sm text-destructive">
                    {errors.education[index].field.message}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <label className="mb-2 block pl-4.5 text-sm font-medium">
                  Start date
                </label>
                <Controller
                  control={control}
                  name={`education.${index}.startDate`}
                  render={({ field }) => (
                    <MonthPicker
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select start date"
                      aria-invalid={
                        !!errors.education?.[index]?.startDate || undefined
                      }
                    />
                  )}
                />
                {errors.education?.[index]?.startDate && (
                  <p className="text-sm text-destructive">
                    {errors.education[index].startDate.message}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <label className="mb-2 block pl-4.5 text-sm font-medium">
                  End date{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </label>
                <Controller
                  control={control}
                  name={`education.${index}.endDate`}
                  render={({ field }) => (
                    <MonthPicker
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select end date"
                    />
                  )}
                />
              </div>
              <div className="space-y-1">
                <label className="mb-2 block pl-4.5 text-sm font-medium">
                  GPA{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </label>
                <Input
                  placeholder="3.8"
                  {...register(`education.${index}.gpa`)}
                />
              </div>
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          className="h-12 w-full gap-2 border-dashed bg-primary/5 text-sm"
          onClick={() =>
            appendEdu({
              id: uuidv4(),
              institution: "",
              degree: "",
              field: "",
              startDate: "",
              endDate: "",
              gpa: "",
            })
          }
        >
          <Plus className="h-4 w-4" /> Add education
        </Button>
      </section>

      {/* Skills */}
      <section className="space-y-3">
        <h3 className="font-medium">Skills</h3>
        <div className="space-y-4 rounded-2xl border bg-muted/30 p-5">
          <div className="flex w-full gap-2">
            <Input
              className="flex-1"
              placeholder="e.g. TypeScript"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSkill();
                }
              }}
            />
            <Select
              value={skillLevel}
              onValueChange={(v) => setSkillLevel(v as typeof skillLevel)}
            >
              <SelectTrigger className="w-36 shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(
                  ["Beginner", "Intermediate", "Advanced", "Expert"] as const
                ).map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              onClick={addSkill}
              className="h-11 shrink-0 gap-1.5"
            >
              <PlusIcon className="h-3.5 w-3.5" /> Add
            </Button>
          </div>
          {errors.skills && (
            <p className="text-sm text-destructive">{errors.skills.message}</p>
          )}
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill.name}
                  className="flex items-center gap-1.5 rounded-md bg-secondary px-2.5 py-1 text-sm text-secondary-foreground"
                >
                  {skill.name}
                  <span className="text-xs text-muted-foreground">
                    · {skill.level}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeSkill(skill.name)}
                    className="ml-0.5 text-muted-foreground hover:text-foreground"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Optional sections */}
      <section className="space-y-4">
        <div>
          <h3 className="font-medium">Optional sections</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Add more detail to stand out — click any section to include it.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(
            [
              { key: "certifications", label: "Certifications", icon: Award },
              { key: "languages", label: "Languages", icon: Globe },
            ] as { key: ToggleKey; label: string; icon: React.ElementType }[]
          ).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() =>
                setToggles((prev) => ({ ...prev, [key]: !prev[key] }))
              }
              className={[
                "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors",
                toggles[key]
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
              ].join(" ")}
            >
              {toggles[key] ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Icon className="h-3.5 w-3.5" />
              )}
              {label}
            </button>
          ))}
        </div>

        {/* Certifications */}
        {toggles.certifications && (
          <div className="space-y-4 rounded-2xl border bg-muted/30 p-5">
            <h4 className="text-sm font-medium">Certifications</h4>
            {certFields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-2">
                <div className="grid flex-1 grid-cols-3 gap-2">
                  <Input
                    placeholder="Certification name"
                    {...register(`certifications.${index}.name`)}
                  />
                  <Input
                    placeholder="Issuer (optional)"
                    {...register(`certifications.${index}.issuer`)}
                  />
                  <Controller
                    control={control}
                    name={`certifications.${index}.date`}
                    render={({ field }) => (
                      <MonthPicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Date"
                      />
                    )}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeCert(index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2 border-dashed bg-primary/5 text-sm"
              size="sm"
              onClick={() =>
                appendCert({ id: uuidv4(), name: "", issuer: "", date: "" })
              }
            >
              <Plus className="mr-1 h-3 w-3" /> Add
            </Button>
          </div>
        )}

        {/* Languages */}
        {toggles.languages && (
          <div className="space-y-4 rounded-2xl border bg-muted/30 p-5">
            <h4 className="text-sm font-medium">Languages</h4>
            {langFields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-2">
                <div className="grid flex-1 grid-cols-2 gap-2">
                  <Input
                    placeholder="Language"
                    {...register(`languages.${index}.language`)}
                  />
                  <Controller
                    control={control}
                    name={`languages.${index}.proficiency`}
                    render={({ field }) => (
                      <Select
                        value={field.value ?? ""}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Proficiency (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            "Native",
                            "Fluent",
                            "Advanced",
                            "Intermediate",
                            "Basic",
                          ].map((level) => (
                            <SelectItem key={level} value={level}>
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeLang(index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full gap-2 border-dashed bg-primary/5 text-sm"
              onClick={() =>
                appendLang({ id: uuidv4(), language: "", proficiency: "" })
              }
            >
              <Plus className="mr-1 h-3 w-3" /> Add
            </Button>
          </div>
        )}
      </section>
    </div>
  );
});

Step4.displayName = "Step4";
export default Step4;
