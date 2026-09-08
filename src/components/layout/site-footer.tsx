import Link from "next/link";
import type { Route } from "next";
import { BrandWordmark, LogoMark } from "@/components/brand/logo";
import { Separator } from "@/components/ui/separator";

const footerGroups = [
  {
    title: "About",
    links: [
      { href: "/about", label: "About PrepHarbor" },
      { href: "/contact", label: "Contact" },
      { href: "/#how-it-works", label: "How it works" },
    ],
  },
  {
    title: "Certifications",
    links: [
      { href: "/certifications", label: "All certifications" },
      { href: "/practice-tests", label: "Practice tests" },
      { href: "/certifications?q=azure", label: "Azure" },
      { href: "/certifications?q=aws", label: "AWS" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/resources", label: "Study resources" },
      { href: "/#faq", label: "FAQ" },
      { href: "/library", label: "My library" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/support", label: "Help center" },
      { href: "/sign-in", label: "Log in" },
      { href: "/sign-up", label: "Sign up" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t bg-muted/40">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-5">
        <div className="space-y-3 lg:col-span-1">
          <Link href="/" className="inline-flex items-center gap-2">
            <LogoMark className="size-7" />
            <BrandWordmark />
          </Link>
          <p className="max-w-xs text-sm text-muted-foreground">
            Original practice tests for professional certifications. Independent of every exam
            vendor.
          </p>
        </div>
        {footerGroups.map((group) => (
          <div key={group.title}>
            <p className="text-sm font-semibold">{group.title}</p>
            <ul className="mt-3 space-y-2">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href as Route}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <Separator />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>© {new Date().getFullYear()} PrepHarbor. All rights reserved.</p>
        <nav className="flex flex-wrap gap-x-4 gap-y-1" aria-label="Legal">
          <Link href="/privacy" className="hover:text-foreground">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-foreground">
            Terms
          </Link>
          <Link href="/contact" className="hover:text-foreground">
            Contact
          </Link>
        </nav>
      </div>
    </footer>
  );
}
