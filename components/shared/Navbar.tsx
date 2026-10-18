import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import LogoutButton from "./LogoutButton";

const NAV_LINKS = [
  { label: "Build", href: "/build" },
  { label: "Templates", href: "/templates" },
];

export default async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="flex h-16 w-full items-center justify-between px-6 xl:px-10">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xl font-bold tracking-tight"
          style={{ fontFamily: "var(--font-jost)" }}
        >
          Cvolt
          <span className="mb-0.5 inline-block h-2 w-2 rounded-full bg-indigo-500" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 sm:flex">
          {NAV_LINKS.map(({ label, href }) => (
            <Button
              key={href}
              variant="ghost"
              size="sm"
              className="font-medium text-muted-foreground hover:text-foreground"
              nativeButton={false}
              render={<Link href={href} />}
            >
              {label}
            </Button>
          ))}
          <div className="mx-2 h-4 w-px bg-border" />
          <Button
            size="sm"
            className="rounded-full px-5"
            nativeButton={false}
            render={<Link href={user ? "/dashboard" : "/login"} />}
          >
            {user ? "Dashboard" : "Sign in"}
          </Button>
          {user && <LogoutButton />}
          <ThemeToggle />
        </nav>

        {/* Mobile nav */}
        <div className="flex items-center gap-1 sm:hidden">
          <ThemeToggle />
          <Sheet>
            <SheetTrigger render={<Button variant="ghost" size="icon" />}>
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-56">
              <SheetHeader>
                <SheetTitle style={{ fontFamily: "var(--font-jost)" }}>
                  Cvolt
                  <span className="mb-0.5 ml-1 inline-block h-1.5 w-1.5 rounded-full bg-indigo-500" />
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-4 flex flex-col gap-1 px-4">
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
                  className="mt-2 justify-start rounded-full"
                  nativeButton={false}
                  render={<Link href={user ? "/dashboard" : "/login"} />}
                >
                  {user ? "Dashboard" : "Sign in"}
                </Button>
                {user && <LogoutButton mobile />}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
