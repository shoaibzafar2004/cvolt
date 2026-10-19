"use client";

import Link from "next/link";
import { useUIStore } from "@/store/uiStore";
import { useResumeStore } from "@/store/resumeStore";
import FilterBar from "@/components/templates/FilterBar";
import TemplateCard from "@/components/templates/TemplateCard";
import type { Template, Payment } from "@/types";

interface TemplateGalleryProps {
  templates: Template[];
  payments: Payment[];
}

export default function TemplateGallery({
  templates,
  payments,
}: TemplateGalleryProps) {
  const { activeFilter } = useUIStore();
  const purchaseId = useResumeStore((s) => s.purchaseId);

  const filtered =
    activeFilter === "all"
      ? templates
      : templates.filter((t) => t.category === activeFilter);

  return (
    <div className="space-y-6">
      {purchaseId && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
          You&apos;re editing a purchased resume. Its own template updates for
          free (
          <Link
            href={`/dashboard/download/${purchaseId}`}
            className="font-medium underline underline-offset-2"
          >
            get the updated PDF
          </Link>
          ); any other template is a new $1.50 purchase and is added as a new
          resume.
        </p>
      )}
      <FilterBar />

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No templates in this category yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              payments={payments}
            />
          ))}
        </div>
      )}
    </div>
  );
}
