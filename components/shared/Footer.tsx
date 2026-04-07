import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t">
      <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Cvolt. One resume, one payment.</p>
        <nav className="flex gap-4">
          <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
          <Link href="/build" className="hover:text-foreground transition-colors">Build resume</Link>
        </nav>
      </div>
    </footer>
  )
}
