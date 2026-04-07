export default function SectionLine({ className }: { className?: string }) {
  return (
    <div className={`absolute hidden lg:flex flex-col items-center pointer-events-none ${className ?? ''}`}>
      <div className="w-7 h-7 rounded-full border-2 border-foreground/25 bg-background shrink-0 shadow-sm" />
      <div className="flex-1 w-px bg-foreground/12" />
      <div className="w-7 h-7 rounded-full border-2 border-foreground/25 bg-background shrink-0 shadow-sm" />
    </div>
  )
}
