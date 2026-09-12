import Link from "next/link";
import type { Route } from "next";
import { BrandLogo } from "@/components/brand/logo";
import { Separator } from "@/components/ui/separator";
import { route } from "@/lib/routes";

const footerGroups = [
  {
    title: "Platform",
    links: [
      { href: "/certifications", label: "Catalog" },
      { href: "/free-questions", label: "Free questions" },
      { href: "/premium-tests", label: "Premium tests" },
      { href: "/#how-it-works", label: "How it works" },
    ],
  },
  {
    title: "Certifications",
    links: [
      { href: "/certifications", label: "All certifications" },
      { href: "/certifications/microsoft", label: "Microsoft" },
      { href: "/certifications/aws", label: "AWS" },
      { href: "/practice-tests", label: "Practice tests" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/resources", label: "Study resources" },
      { href: "/#faq", label: "FAQ" },
      { href: "/dashboard/tests", label: "My library" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/support", label: "Help center" },
      { href: "/contact", label: "Contact" },
      { href: "/sign-in", label: "Log in" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms" },
      { href: "/refund", label: "Refund Policy" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t bg-muted/40">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-6">
        <div className="space-y-3 lg:col-span-1">
          <Link href="/" className="inline-flex items-center gap-2">
            <BrandLogo />
          </Link>
          <p className="max-w-xs text-sm text-muted-foreground">
            Practice. Prepare. Certify. Original practice tests for professional certifications,
            independent of every exam vendor.
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
        <p>© {new Date().getFullYear()} Certiva. All rights reserved.</p>
        <nav className="flex flex-wrap gap-x-4 gap-y-1" aria-label="Legal">
          <Link href="/privacy" className="hover:text-foreground">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-foreground">
            Terms
          </Link>
          <Link href={route("/refund")} className="hover:text-foreground">
            Refunds
          </Link>
          <Link href="/contact" className="hover:text-foreground">
            Contact
          </Link>
        </nav>
      </div>
    </footer>
  );
}
