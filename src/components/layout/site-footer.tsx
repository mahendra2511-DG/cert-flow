import Link from "next/link";
import { BrandWordmark, LogoMark } from "@/components/brand/logo";
import { Separator } from "@/components/ui/separator";

const footerGroups = [
  {
    title: "Catalog",
    links: [
      { href: "/certifications", label: "All certifications" },
      { href: "/practice-tests", label: "Practice tests" },
      { href: "/library", label: "Purchased tests" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/sign-in", label: "Sign in" },
      { href: "/account", label: "Profile" },
      { href: "/results/sample", label: "Sample results" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About PrepHarbor" },
      { href: "/checkout/saa-c03-full-length", label: "Checkout (preview)" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t bg-muted/40">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="space-y-3">
          <Link href="/" className="inline-flex items-center gap-2">
            <LogoMark className="size-7" />
            <BrandWordmark />
          </Link>
          <p className="max-w-xs text-sm text-muted-foreground">
            Original practice tests for professional certifications. Study, purchase, sit the exam,
            and review explanations in one place.
          </p>
        </div>
        {footerGroups.map((group) => (
          <div key={group.title}>
            <p className="text-sm font-semibold">{group.title}</p>
            <ul className="mt-3 space-y-2">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
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
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>© {new Date().getFullYear()} PrepHarbor. All rights reserved.</p>
        <p>Independent study marketplace. Not affiliated with any certification vendor.</p>
      </div>
    </footer>
  );
}
