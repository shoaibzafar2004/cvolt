import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Menu } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import LogoutButton from './LogoutButton'

const NAV_LINKS = [
  { label: 'Build', href: '/build' },
  { label: 'Templates', href: '/templates' },
]

export default async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-40">
      <div className="w-full px-6 xl:px-10 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xl font-bold tracking-tight"
          style={{ fontFamily: 'var(--font-jost)' }}
        >
          Cvolt
          <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block mb-0.5" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-1">
          {NAV_LINKS.map(({ label, href }) => (
            <Button
              key={href}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground font-medium"
              nativeButton={false}
              render={<Link href={href} />}
            >
              {label}
            </Button>
          ))}
          <div className="w-px h-4 bg-border mx-2" />
          <Button
            size="sm"
            className="rounded-full px-5"
            nativeButton={false}
            render={<Link href={user ? '/dashboard' : '/login'} />}
          >
            {user ? 'Dashboard' : 'Sign in'}
          </Button>
          {user && <LogoutButton />}
          <ThemeToggle />
        </nav>

        {/* Mobile nav */}
        <div className="sm:hidden flex items-center gap-1">
          <ThemeToggle />
          <Sheet>
            <SheetTrigger render={<Button variant="ghost" size="icon" />}>
              <Menu className="w-5 h-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-56">
              <SheetHeader>
                <SheetTitle style={{ fontFamily: 'var(--font-jost)' }}>
                  Cvolt<span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 ml-1 mb-0.5" />
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 mt-4 px-4">
                {NAV_LINKS.map(({ label, href }) => (
                  <Button
                    key={href}
                    variant="ghost"
                    className="justify-start text-muted-foreground"
                    nativeButton={false}
                    render={<Link href={href} />}
                  >
                    {label}
                  </Button>
                ))}
                <Button
                  className="justify-start mt-2 rounded-full"
                  nativeButton={false}
                  render={<Link href={user ? '/dashboard' : '/login'} />}
                >
                  {user ? 'Dashboard' : 'Sign in'}
                </Button>
                {user && <LogoutButton mobile />}
              </nav>
            </SheetContent>
          </Sheet>
        </div>

      </div>
    </header>
  )
}
