import { Skeleton } from "@/components/ui/skeleton";

export default function BuildLoading() {
  return (
    <div className="flex flex-1 overflow-hidden bg-muted/30">
      {/* ── Left sidebar — step indicators ── */}
      <div className="relative hidden w-64 shrink-0 flex-col py-12 lg:flex xl:w-88">
        {/* Section line placeholder */}
        <div className="absolute top-12 bottom-12 left-8 w-px bg-border" />

        <div className="mt-4 flex flex-col gap-18 pr-4 pl-22">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              {/* Icon circle */}
              <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
              {/* Short connector */}
              <div className="h-px w-4 shrink-0 bg-border" />
              {/* Labels */}
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right — form + nav ── */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Mobile top strip */}
        <div className="flex shrink-0 items-center gap-3 border-b bg-background px-4 py-3 lg:hidden">
          <Skeleton className="h-3 w-8" />
          <Skeleton className="h-1 flex-1 rounded-full" />
          <Skeleton className="h-3 w-24" />
        </div>

        {/* Form area */}
        <div className="flex-1 overflow-auto px-4 pt-8 pb-4 lg:px-8 xl:px-12">
          {/* Step heading */}
          <Skeleton className="mx-1 mt-8 mb-4 h-7 w-36" />

          {/* Form card — mirrors Step 1 personal info layout */}
          <div className="space-y-6 rounded-2xl border bg-background p-6 shadow-sm lg:p-10">
            {/* Photo row */}
            <div className="flex items-center gap-4">
              <Skeleton className="h-20 w-20 shrink-0 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-28 rounded-md" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>

            <div className="h-px bg-border" />

            {/* Two-column fields */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <Skeleton className="h-3.5 w-20" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Nav buttons */}
        <div className="flex shrink-0 justify-end px-4 py-5 lg:px-8 xl:px-12">
          <Skeleton className="h-11 w-28 rounded-full" />
        </div>
      </div>
    </div>
  );
}
