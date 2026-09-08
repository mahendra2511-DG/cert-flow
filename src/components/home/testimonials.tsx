import { StarRating } from "@/components/catalog/star-rating";
import { PageContainer, SectionHeader } from "@/components/layout/page-container";
import { EmptyState } from "@/components/ui-patterns/empty-state";
import type { CatalogTestimonial } from "@/lib/catalog/types";

export function Testimonials({ items }: { items: CatalogTestimonial[] }) {
  return (
    <section className="py-16 sm:py-20" aria-labelledby="testimonials-heading">
      <PageContainer>
        <SectionHeader
          titleId="testimonials-heading"
          eyebrow="Learners"
          title="What practitioners say after a sitting"
          description="Quotes below are representative placeholders for the launch catalog. Swap them for verified reviews when accounts are live."
        />
        {items.length === 0 ? (
          <EmptyState
            title="Reviews will appear here"
            description="After learners complete a test, ratings and comments will populate this section."
          />
        ) : (
          <ul className="grid gap-4 md:grid-cols-3">
            {items.map((item) => (
              <li key={item.name} className="flex h-full flex-col rounded-2xl border bg-card p-6">
                <StarRating value={5} showCount={false} className="mb-4" />
                <blockquote className="flex-1 text-sm leading-6">{item.quote}</blockquote>
                <footer className="mt-5 border-t pt-4">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{item.role}</p>
                  <p className="mt-1 text-xs font-medium text-primary">Practiced {item.exam}</p>
                </footer>
              </li>
            ))}
          </ul>
        )}
      </PageContainer>
    </section>
  );
}
