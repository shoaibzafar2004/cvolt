import { Skeleton } from '@/components/ui/skeleton'

export default function TemplatesLoading() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      {/* Heading */}
      <div className="mb-8">
        <Skeleton className="mb-2 h-9 w-56" />
        <Skeleton className="h-5 w-80" />
      </div>

      <div className="space-y-6">
        {/* FilterBar — 4 pill buttons */}
        <div className="flex flex-wrap gap-2">
          {[72, 56, 72, 80].map((w, i) => (
            <Skeleton key={i} className={`h-8 w-${w / 4} rounded-full`} style={{ width: w }} />
          ))}
        </div>

        {/* Card grid — matches grid-cols-1 sm:2 lg:3 xl:4 */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="overflow-hidden rounded-xl border bg-card">
              {/* Live preview area — matches CARD_HEIGHT: 340px */}
              <Skeleton className="w-full" style={{ height: 340 }} />
              {/* Footer */}
              <div className="flex items-center justify-between border-t px-4 py-3">
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-7 w-24 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
