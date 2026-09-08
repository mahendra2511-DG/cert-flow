import Link from "next/link";
import type { Route } from "next";
import { PageContainer, SectionHeader } from "@/components/layout/page-container";
import { EmptyState } from "@/components/ui-patterns/empty-state";
import { ArrowUpRight } from "lucide-react";
import type { CatalogCategory } from "@/lib/catalog/types";

export function PopularCategories({
  categories,
}: {
  categories: Array<CatalogCategory & { examCount: number }>;
}) {
  return (
    <section className="py-16 sm:py-20" aria-labelledby="popular-categories-heading">
      <PageContainer>
        <SectionHeader
          titleId="popular-categories-heading"
          eyebrow="Catalog"
          title="Popular certification categories"
          description="Start from a vendor track. Azure sits beside Microsoft so you can jump straight into cloud-admin practice."
          action={
            <Link
              href="/certifications"
              className="text-sm font-medium text-primary hover:underline"
            >
              All certifications
            </Link>
          }
        />
        {categories.length === 0 ? (
          <EmptyState
            title="Categories are being prepared"
            description="The catalog will list vendor tracks here once exams are published."
            actionHref="/certifications"
            actionLabel="Open the catalog"
          />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <li key={category.slug} className={category.slug === "other" ? "lg:col-span-2" : undefined}>
                <Link
                  href={(category.href ?? `/certifications?q=${encodeURIComponent(category.hrefQuery)}`) as Route}
                  className={`group block h-full rounded-2xl border bg-gradient-to-br ${category.accent} p-5 ring-1 ring-foreground/5 transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-heading text-lg font-semibold">{category.name}</h3>
                    <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{category.description}</p>
                  <p className="mt-4 text-xs font-medium text-foreground/80">
                    {category.examCount} {category.examCount === 1 ? "exam" : "exams"}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </PageContainer>
    </section>
  );
}
