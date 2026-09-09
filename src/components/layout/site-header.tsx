"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import { signOut, useSession } from "next-auth/react";
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
import { route } from "@/lib/routes";

export const primaryNav = [
  { href: "/certifications", label: "Certifications" },
  { href: "/practice-tests", label: "Practice Tests" },
  { href: "/free-questions", label: "Free Questions" },
  { href: "/premium-tests", label: "Premium Tests" },
  { href: "/resources", label: "Resources" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const signedIn = status === "authenticated" && Boolean(session?.user);

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
                href={route(item.href)}
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
          {status === "loading" ? (
            <div className="hidden h-8 w-24 animate-pulse rounded-lg bg-muted sm:block" />
          ) : signedIn ? (
            <>
              {session?.user?.role === "admin" || session?.user?.role === "editor" ? (
                <Button nativeButton={false} render={<Link href={route("/admin")} />} variant="ghost">
                  Admin
                </Button>
              ) : null}
              <Button nativeButton={false} render={<Link href={route("/dashboard")} />} variant="ghost">
                Dashboard
              </Button>
              <Button nativeButton={false} render={<Link href={route("/dashboard/profile")} />} variant="ghost" className="hidden sm:inline-flex">
                Profile
              </Button>
              <Button
                type="button"
                variant="outline"
                className="hidden sm:inline-flex"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Log out
              </Button>
            </>
          ) : (
            <>
              <Button nativeButton={false} render={<Link href="/sign-in" />} variant="ghost">
                Log in
              </Button>
              <Button nativeButton={false} render={<Link href="/sign-up" />} className="hidden sm:inline-flex">
                Sign up
              </Button>
            </>
          )}

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
                {[
                  ...primaryNav,
                  ...(signedIn
                    ? [
                        ...(session?.user?.role === "admin" || session?.user?.role === "editor"
                          ? [{ href: "/admin", label: "Admin" }]
                          : []),
                        { href: "/dashboard", label: "Dashboard" },
                        { href: "/dashboard/tests", label: "My tests" },
                        { href: "/dashboard/profile", label: "Profile" },
                      ]
                    : [
                        { href: "/about", label: "About" },
                      ]),
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href as Route}
                    className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="mt-4 space-y-2">
                  <CatalogSearch id="mobile-search" />
                  {signedIn ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => signOut({ callbackUrl: "/" })}
                    >
                      Log out
                    </Button>
                  ) : (
                    <>
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
                    </>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
