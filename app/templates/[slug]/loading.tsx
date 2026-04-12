import { Skeleton } from '@/components/ui/skeleton'

export default function TemplateDetailLoading() {
  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)]">

      {/* Left — resume preview area */}
      <div className="flex-1 overflow-auto bg-muted/30 flex flex-col items-center p-8 gap-4">
        {/* Zoom controls */}
        <div className="flex items-center gap-2 bg-background border rounded-lg px-3 py-1.5 shadow-sm shrink-0">
          <Skeleton className="h-7 w-7 rounded-md" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-7 w-7 rounded-md" />
        </div>

        {/* Resume skeleton */}
        <Skeleton className="w-75.5 flex-1 max-h-215 rounded-sm shrink-0" />
      </div>

      {/* Right — info panel */}
      <div className="w-full lg:w-80 border-l bg-card flex flex-col p-8 gap-6 shrink-0">
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
        <Skeleton className="h-4 w-32 mx-auto" />
      </div>
    </div>
  )
}
