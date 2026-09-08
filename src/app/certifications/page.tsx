import { CertificationCard, PracticeTestCard } from "@/components/catalog/cards";
import { CatalogSearch } from "@/components/catalog/search-form";
import { EmptyState } from "@/components/ui-patterns/empty-state";
import { searchCatalog } from "@/lib/catalog/data";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Certifications",
  description: "Search certification tracks by vendor, exam code, or topic.",
  path: "/certifications",
});

export default async function CertificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const results = searchCatalog(q ?? "");

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold">Certifications</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Filter the catalog by name, vendor, or exam code. Each track opens a detail page with
        available practice tests.
      </p>
      <div className="mt-6 max-w-xl">
        <CatalogSearch id="certifications-search" defaultValue={q} />
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Tracks</h2>
        {results.certifications.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title="No certifications match that search"
              description="Try a vendor name or exam code, or clear the search to see the full catalog."
              actionHref="/certifications"
              actionLabel="Clear search"
            />
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.certifications.map((item) => (
              <CertificationCard key={item.slug} item={item} />
            ))}
          </div>
        )}
      </section>

      {q && results.practiceTests.length > 0 ? (
        <section className="mt-12">
          <h2 className="text-xl font-semibold">Matching practice tests</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {results.practiceTests.map((item) => (
              <PracticeTestCard key={item.slug} item={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
