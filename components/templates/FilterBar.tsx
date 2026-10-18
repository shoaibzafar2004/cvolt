"use client";

import { useUIStore } from "@/store/uiStore";

const FILTERS = [
  { label: "All", value: "all" },
  { label: "Clean", value: "clean" },
  { label: "Modern", value: "modern" },
  { label: "Creative", value: "creative" },
] as const;

export default function FilterBar() {
  const { activeFilter, setFilter } = useUIStore();

  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map(({ label, value }) => (
        <button
          key={value}
          onClick={() => setFilter(value)}
          className={[
            "rounded-full border px-4 py-1.5 text-sm transition-colors",
            activeFilter === value
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
          ].join(" ")}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
