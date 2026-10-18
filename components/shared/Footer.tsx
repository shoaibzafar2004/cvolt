import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row">
        <p>&copy; {new Date().getFullYear()} Cvolt. One resume, one payment.</p>
        <nav className="flex gap-4">
          <Link
            href="/privacy"
            className="transition-colors hover:text-foreground"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="transition-colors hover:text-foreground"
          >
            Terms
          </Link>
          <Link
            href="/build"
            className="transition-colors hover:text-foreground"
          >
            Build resume
          </Link>
        </nav>
      </div>
    </footer>
  );
}
