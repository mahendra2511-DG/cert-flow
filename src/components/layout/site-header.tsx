"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { BrandWordmark, LogoMark } from "@/components/brand/logo";
import { CatalogSearch } from "@/components/catalog/search-form";
import { Button } from "@/components/ui/button";
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
  { href: "/practice-tests", label: "Practice Tests" },
] as const;

const mobileExtraNav = [
  { href: "/library", label: "My library" },
  { href: "/account", label: "Account" },
  { href: "/about", label: "About" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="PrepHarbor home">
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

        <div className="ml-auto hidden min-w-0 flex-1 lg:block lg:max-w-sm">
          <CatalogSearch id="header-search" showSubmit={false} />
        </div>

        <div className="ml-auto flex items-center gap-2 lg:ml-2">
          <Button nativeButton={false} render={<Link href="/sign-in" />} variant="ghost">
            Log in
          </Button>
          <Button nativeButton={false} render={<Link href="/sign-up" />} className="hidden sm:inline-flex">
            Sign up
          </Button>

          <Sheet>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu" />
              }
            >
              <Menu className="size-4" />
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4 pb-6" aria-label="Mobile">
                {[...primaryNav, ...mobileExtraNav].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="mt-4 space-y-2">
                  <CatalogSearch id="mobile-search" />
                  <Button nativeButton={false} render={<Link href="/sign-up" />} className="w-full">
                    Sign up
                  </Button>
                  <Button
                    nativeButton={false}
                    render={<Link href="/sign-in" />}
                    variant="outline"
                    className="w-full"
                  >
                    Log in
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
