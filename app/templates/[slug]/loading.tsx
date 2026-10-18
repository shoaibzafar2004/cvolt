import { Skeleton } from "@/components/ui/skeleton";

export default function TemplateDetailLoading() {
  return (
    <div className="flex h-[calc(100vh-64px)] flex-col lg:flex-row">
      {/* Left — resume preview area */}
      <div className="flex flex-1 flex-col items-center gap-4 overflow-auto bg-muted/30 p-8">
        {/* Zoom controls */}
        <div className="flex shrink-0 items-center gap-2 rounded-lg border bg-background px-3 py-1.5 shadow-sm">
          <Skeleton className="h-7 w-7 rounded-md" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-7 w-7 rounded-md" />
        </div>

        {/* Resume skeleton */}
        <Skeleton className="max-h-215 w-75.5 flex-1 shrink-0 rounded-sm" />
      </div>

      {/* Right — info panel */}
      <div className="flex w-full shrink-0 flex-col gap-6 border-l bg-card p-8 lg:w-80">
        <div className="space-y-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        <div className="space-y-1">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-3 w-48" />
        </div>

        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="mx-auto h-4 w-32" />
      </div>
    </div>
  );
}
