import { Skeleton } from '@/components/ui/skeleton'

export default function BuildLoading() {
  return (
    <div className="flex-1 flex overflow-hidden bg-muted/30">

      {/* ── Left sidebar — step indicators ── */}
      <div className="hidden lg:flex w-64 xl:w-88 shrink-0 flex-col py-12 relative">
        {/* Section line placeholder */}
        <div className="absolute left-8 top-12 bottom-12 w-px bg-border" />

        <div className="pl-22 pr-4 flex flex-col gap-18 mt-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              {/* Icon circle */}
              <Skeleton className="w-11 h-11 rounded-full shrink-0" />
              {/* Short connector */}
              <div className="w-4 h-px bg-border shrink-0" />
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
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile top strip */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b bg-background shrink-0">
          <Skeleton className="h-3 w-8" />
          <Skeleton className="flex-1 h-1 rounded-full" />
          <Skeleton className="h-3 w-24" />
        </div>

        {/* Form area */}
        <div className="flex-1 overflow-auto px-4 lg:px-8 xl:px-12 pt-8 pb-4">
          {/* Step heading */}
          <Skeleton className="h-7 w-36 mt-8 mb-4 mx-1" />

          {/* Form card — mirrors Step 1 personal info layout */}
          <div className="bg-background rounded-2xl border shadow-sm p-6 lg:p-10 space-y-6">
            {/* Photo row */}
            <div className="flex items-center gap-4">
              <Skeleton className="w-20 h-20 rounded-full shrink-0" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-28 rounded-md" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>

            <div className="h-px bg-border" />

            {/* Two-column fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        <div className="px-4 lg:px-8 xl:px-12 py-5 flex justify-end shrink-0">
          <Skeleton className="h-11 w-28 rounded-full" />
        </div>
      </div>
    </div>
  )
}
