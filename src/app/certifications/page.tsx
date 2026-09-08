import { CatalogFilters } from "@/components/catalog/filters";
import { ExamCard } from "@/components/catalog/exam-card";
import { Pagination } from "@/components/catalog/pagination";
import { Breadcrumbs } from "@/components/catalog/breadcrumbs";
import { EmptyState } from "@/components/ui-patterns/empty-state";
import { PageContainer } from "@/components/layout/page-container";
import { listExams, listFilterCategories, listVendors } from "@/lib/catalog/repository";
import { catalogHref, parseCatalogSearch } from "@/lib/catalog/search-params";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Certification practice exams",
  description:
    "Browse PrepHarbor practice exams by provider, category, price, and rating. Original questions with INR checkout.",
  path: "/certifications",
});

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
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Certifications" }]} />
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">Certification exams</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Filter by provider or category, then open an exam for format, pricing, and a purchase path.
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
    </PageContainer>
  );
}
