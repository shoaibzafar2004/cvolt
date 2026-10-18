export default function SectionLine({ className }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute hidden flex-col items-center lg:flex ${className ?? ''}`}
    >
      <div className="h-7 w-7 shrink-0 rounded-full border-2 border-foreground/25 bg-background shadow-sm" />
      <div className="w-px flex-1 bg-foreground/12" />
      <div className="h-7 w-7 shrink-0 rounded-full border-2 border-foreground/25 bg-background shadow-sm" />
    </div>
  )
}
