import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "About",
  description: "What PrepHarbor is and how this marketplace is structured.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold">About PrepHarbor</h1>
      <div className="mt-4 space-y-4 text-muted-foreground">
        <p>
          PrepHarbor is an original certification practice-test marketplace. The information
          architecture follows a familiar study-site pattern: search a catalog, open a
          certification, inspect a practice test, purchase access, take the exam, then review
          results.
        </p>
        <p>
          Branding, copy, UI, and question content are original. The product is not affiliated with
          any certification vendor and does not reproduce proprietary exam items.
        </p>
        <p>
          This repository currently ships the application foundation: layout, navigation, schema,
          authentication, payments configuration, and working catalog routes with sample data.
        </p>
      </div>
    </div>
  );
}
