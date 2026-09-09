import { createMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/catalog/breadcrumbs";

export const metadata = createMetadata({
  title: "About",
  description: "What Certiva is and how this marketplace is structured.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "About" }]} />
      <h1 className="mt-4 text-3xl font-semibold">About Certiva</h1>
      <div className="mt-4 space-y-4 text-muted-foreground">
        <p>
          Certiva is an original certification practice-test marketplace. The information
          architecture follows a familiar study-site pattern: search a catalog, open a
          certification, inspect a practice test, purchase access, take the exam, then review
          results.
        </p>
        <h2 className="text-xl font-semibold text-foreground">Independent practice</h2>
        <p>
          Branding, copy, UI, and question content are original. The product is not affiliated with
          any certification vendor and does not reproduce proprietary exam items.
        </p>
        <h2 className="text-xl font-semibold text-foreground">What you can do here</h2>
        <p>
          Browse published exams, sit a timed test after checkout, and review explanations on the
          account that paid. Dashboard, checkout, and admin routes are signed-in surfaces and are
          not written for search engines.
        </p>
      </div>
    </div>
  );
}
