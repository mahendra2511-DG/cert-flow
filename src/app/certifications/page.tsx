import { CatalogFilters } from "@/components/catalog/filters";
import { ExamCard } from "@/components/catalog/exam-card";
import { Pagination } from "@/components/catalog/pagination";
import { Breadcrumbs } from "@/components/catalog/breadcrumbs";
import { EmptyState } from "@/components/ui-patterns/empty-state";
import { PageContainer } from "@/components/layout/page-container";
import { JsonLd } from "@/components/seo/json-ld";
import { listExams, listFilterCategories, listVendors } from "@/lib/catalog/repository";
import { catalogHref, parseCatalogSearch } from "@/lib/catalog/search-params";
import { createMetadata } from "@/lib/seo";
import { itemListJsonLd } from "@/lib/seo/structured-data";
import type { Metadata } from "next";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; vendor?: string; category?: string; sort?: string; page?: string }>;
}): Promise<Metadata> {
  const filters = parseCatalogSearch(await searchParams);
  const [vendors, categories] = await Promise.all([listVendors(), listFilterCategories()]);
  const vendor = vendors.find((item) => item.slug === filters.vendor);
  const category = categories.find((item) => item.slug === filters.category);
  const hasSearch = Boolean(filters.q);

  if (vendor) {
    return createMetadata({
      title: `${vendor.name} certification practice tests`,
      description: vendor.description,
      path: "/certifications",
      canonicalPath: `/certifications/${vendor.slug}`,
      noIndex: hasSearch,
    });
  }

  if (category) {
    return createMetadata({
      title: `${category.name} certification practice exams`,
      description: `${category.description} Browse original PrepHarbor sittings for this category, then open an exam for format, price, and checkout.`,
      path: "/certifications",
      canonicalPath: "/certifications",
      noIndex: hasSearch || filters.page > 1,
    });
  }

  const pageLabel = filters.page > 1 ? ` (page ${filters.page})` : "";
  return createMetadata({
    title: `Certification practice exams${pageLabel}`,
    description:
      "Browse original certification practice exams by provider and category. Open an exam for format, timing, INR pricing, and the practice-test sitting.",
    path: "/certifications",
    canonicalPath: "/certifications",
    noIndex: hasSearch || filters.page > 1,
  });
}

export default async function CertificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; vendor?: string; category?: string; sort?: string; page?: string }>;
}) {
  const raw = await searchParams;
  const filters = parseCatalogSearch(raw);
  const [vendors, categories, result] = await Promise.all([
    listVendors(),
    listFilterCategories(),
    listExams(filters),
  ]);

  const popular = await listExams({ popularOnly: true, pageSize: 4, sort: "popular" });
  const showPopular = !filters.q && !filters.vendor && !filters.category && filters.page === 1;

  return (
    <PageContainer className="py-10">
      <JsonLd
        data={itemListJsonLd(
          "Certification practice exams",
          result.items.map((exam) => ({ name: `${exam.code} ${exam.name}`, url: exam.href })),
        )}
      />
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Certifications" }]} />
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">Certification exams</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Independent practice tests grouped by provider. Filter the catalog, then open an exam for
        the outline, timing, and purchase path. These sittings do not replace a vendor credential.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <aside>
          <details className="rounded-2xl border lg:hidden">
            <summary className="cursor-pointer px-4 py-3 text-sm font-medium">Filters</summary>
            <div className="border-t p-2">
              <CatalogFilters
                q={filters.q}
                vendor={filters.vendor}
                category={filters.category}
                sort={filters.sort}
                vendors={vendors}
                categories={categories}
              />
            </div>
          </details>
          <div className="hidden lg:block">
            <CatalogFilters
              q={filters.q}
              vendor={filters.vendor}
              category={filters.category}
              sort={filters.sort}
              vendors={vendors}
              categories={categories}
            />
          </div>
        </aside>

        <div>
          {showPopular ? (
            <section className="mb-10" aria-labelledby="popular-exams-heading">
              <h2 id="popular-exams-heading" className="text-xl font-semibold">
                Popular certifications
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Frequently opened exams across cloud, security, and networking tracks.
              </p>
              <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                {popular.items.map((exam) => (
                  <li key={`${exam.vendorSlug}-${exam.examSlug}`}>
                    <ExamCard exam={exam} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section aria-labelledby="all-exams-heading">
            <div className="mb-4 flex items-end justify-between gap-3">
              <h2 id="all-exams-heading" className="text-xl font-semibold">
                All certifications
              </h2>
              <p className="text-sm text-muted-foreground">
                {result.total} {result.total === 1 ? "exam" : "exams"}
              </p>
            </div>
            {result.items.length === 0 ? (
              <EmptyState
                title="No exams match those filters"
                description="Clear search or choose another provider to see the full catalog."
                actionHref="/certifications"
                actionLabel="Reset catalog"
              />
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2">
                {result.items.map((exam) => (
                  <li key={`${exam.vendorSlug}-${exam.examSlug}`}>
                    <ExamCard exam={exam} />
                  </li>
                ))}
              </ul>
            )}
            <Pagination
              page={result.page}
              pageCount={result.pageCount}
              hrefForPage={(page) =>
                catalogHref("/certifications", {
                  q: filters.q,
                  vendor: filters.vendor,
                  category: filters.category,
                  sort: filters.sort,
                  page,
                })
              }
            />
          </section>
        </div>
      </div>

      <section className="mt-16 max-w-3xl border-t pt-10" aria-labelledby="catalog-guide-heading">
        <h2 id="catalog-guide-heading" className="text-2xl font-semibold">
          How this catalog is organized
        </h2>
        <p className="mt-3 text-muted-foreground">
          Each provider page lists that vendor’s published exams. An exam page explains the sitting
          (length, format, pass mark) and links to the practice test. Pay once in INR to unlock the
          browser exam, retakes, and explanations.
        </p>
        <h3 className="mt-8 text-lg font-semibold">What PrepHarbor does not sell</h3>
        <p className="mt-2 text-muted-foreground">
          These are not official vendor exams, vouchers, or dumps of live items. Pair a PrepHarbor
          sitting with the provider’s current public skill outline.
        </p>
      </section>
    </PageContainer>
  );
}
