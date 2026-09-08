"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search } from "lucide-react";
import { BrandWordmark, LogoMark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export const primaryNav = [
  { href: "/certifications", label: "Certifications" },
  { href: "/practice-tests", label: "Practice tests" },
  { href: "/library", label: "My library" },
  { href: "/account", label: "Account" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <LogoMark />
          <BrandWordmark />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {primaryNav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <form
          action="/certifications"
          className="ml-auto hidden min-w-0 flex-1 items-center gap-2 lg:flex lg:max-w-sm"
          role="search"
        >
          <div className="relative w-full">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="q"
              type="search"
              placeholder="Search exams or codes"
              className="pl-8"
              aria-label="Search certifications"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <Button nativeButton={false} render={<Link href="/sign-in" />} variant="outline">
            Sign in
          </Button>
          <Button nativeButton={false} render={<Link href="/practice-tests" />} className="hidden sm:inline-flex">
            Browse tests
          </Button>

          <Sheet>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu" />
              }
            >
              <Menu className="size-4" />
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>Navigate</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-1 px-4">
                {primaryNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
                  >
                    {item.label}
                  </Link>
                ))}
                <form action="/certifications" className="mt-4" role="search">
                  <Input name="q" type="search" placeholder="Search exams" />
                </form>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
