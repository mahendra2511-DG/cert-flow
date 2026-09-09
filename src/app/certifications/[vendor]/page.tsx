import { notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { CatalogFilters } from "@/components/catalog/filters";
import { ExamCard } from "@/components/catalog/exam-card";
import { Breadcrumbs } from "@/components/catalog/breadcrumbs";
import { EmptyState } from "@/components/ui-patterns/empty-state";
import { Badge } from "@/components/ui/badge";
import { PageContainer } from "@/components/layout/page-container";
import { getVendor, listExams, listFilterCategories, listVendors } from "@/lib/catalog/repository";
import { catalogHref, parseCatalogSearch } from "@/lib/catalog/search-params";
import { seedVendors } from "@/lib/catalog/seed-catalog";
import { Pagination } from "@/components/catalog/pagination";
import { vendorStudyCopy } from "@/lib/seo/copy";
import { createMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { itemListJsonLd } from "@/lib/seo/structured-data";

export async function generateStaticParams() {
  return seedVendors.map((vendor) => ({ vendor: vendor.slug }));
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ vendor: string }>;
  searchParams: Promise<{ q?: string; category?: string; sort?: string; page?: string }>;
}) {
  const { vendor } = await params;
  const filters = parseCatalogSearch(await searchParams);
  const detail = await getVendor(vendor);
  if (!detail) {
    return createMetadata({
      title: "Provider not found",
      description: "That certification provider is not in the Certiva catalog.",
      path: `/certifications/${vendor}`,
      noIndex: true,
    });
  }

  return createMetadata({
    title: `${detail.name} certification practice tests`,
    description: `${detail.description} Original timed sittings with scores and explanations.`,
    path: `/certifications/${detail.slug}`,
    noIndex: Boolean(filters.q) || filters.page > 1,
  });
}

export default async function VendorPage({
  params,
  searchParams,
}: {
  params: Promise<{ vendor: string }>;
  searchParams: Promise<{ q?: string; category?: string; sort?: string; page?: string }>;
}) {
  const { vendor } = await params;
  const detail = await getVendor(vendor);
  if (!detail) {
    notFound();
  }

  const raw = await searchParams;
  const filters = parseCatalogSearch({ ...raw, vendor: detail.slug });
  const [categories, vendors, result] = await Promise.all([
    listFilterCategories(),
    listVendors(),
    listExams({ ...filters, vendor: detail.slug }),
  ]);

  const vendorCategories = categories.filter((category) =>
    detail.categories.some((item) => item.slug === category.slug),
  );

  return (
    <PageContainer className="py-10">
      <JsonLd
        data={itemListJsonLd(
          `${detail.name} certification practice exams`,
          result.items.map((exam) => ({ name: `${exam.code} ${exam.name}`, url: exam.href })),
        )}
      />
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: "/certifications", label: "Certifications" },
          { label: detail.name },
        ]}
      />
      <header className="mt-4 border-b pb-8">
        <Badge variant="secondary">Provider</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          {detail.name} practice tests
        </h1>
        <p className="mt-3 max-w-3xl text-muted-foreground">{detail.longDescription}</p>
      </header>

      <section className="py-8" aria-labelledby="vendor-study-heading">
        <h2 id="vendor-study-heading" className="text-xl font-semibold">
          How to use this catalog
        </h2>
        <p className="mt-3 max-w-3xl text-muted-foreground">{vendorStudyCopy(detail)}</p>
        <h3 className="mt-6 text-base font-semibold">What you unlock</h3>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          A purchase on an exam’s practice test unlocks the browser sitting, retakes, and
          explanation review for that test on your account. Unpublished exams stay out of this
          page.
        </p>
      </section>

      <section className="py-8" aria-labelledby="vendor-categories-heading">
        <h2 id="vendor-categories-heading" className="text-xl font-semibold">
          Categories
        </h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {detail.categories.map((category) => (
            <li key={category.slug}>
              <Link
                href={catalogHref(`/certifications/${detail.slug}`, { category: category.slug }) as Route}
                className="inline-flex items-center rounded-full border bg-card px-3 py-1 text-sm hover:bg-muted"
              >
                {category.name}
                <span className="ml-2 text-muted-foreground">{category.examCount}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <aside>
          <CatalogFilters
            action={`/certifications/${detail.slug}`}
            q={filters.q}
            category={filters.category}
            sort={filters.sort}
            vendors={vendors}
            categories={vendorCategories}
            hideVendor
          />
        </aside>
        <section aria-labelledby="vendor-exams-heading">
          <div className="mb-4 flex items-end justify-between gap-3">
            <h2 id="vendor-exams-heading" className="text-xl font-semibold">
              Available exams
            </h2>
            <p className="text-sm text-muted-foreground">{result.total} exams</p>
          </div>
          {result.items.length === 0 ? (
            <EmptyState
              title="No exams in this filter"
              description="Try another category or clear search."
              actionHref={`/certifications/${detail.slug}` as Route}
              actionLabel="View all provider exams"
            />
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2">
              {result.items.map((exam) => (
                <li key={exam.examSlug}>
                  <ExamCard exam={exam} />
                </li>
              ))}
            </ul>
          )}
          <Pagination
            page={result.page}
            pageCount={result.pageCount}
            hrefForPage={(page) =>
              catalogHref(`/certifications/${detail.slug}`, {
                q: filters.q,
                category: filters.category,
                sort: filters.sort,
                page,
              })
            }
          />
        </section>
      </div>
    </PageContainer>
  );
}
