import { PracticeTestCard } from "@/components/catalog/cards";
import { Breadcrumbs } from "@/components/catalog/breadcrumbs";
import { EmptyState } from "@/components/ui-patterns/empty-state";
import { PageContainer } from "@/components/layout/page-container";
import { JsonLd } from "@/components/seo/json-ld";
import { listPublicPracticeTests } from "@/lib/admin/catalog-store";
import { createMetadata, practiceTestPath } from "@/lib/seo";
import { itemListJsonLd } from "@/lib/seo/structured-data";
import { route } from "@/lib/routes";

export const metadata = createMetadata({
  title: "Timed practice tests",
  description:
    "Timed certification practice tests with scores, retakes, and explanations after an INR purchase.",
  path: "/practice-tests",
});

export default function PracticeTestsPage() {
  const tests = listPublicPracticeTests();
  return (
    <PageContainer className="py-10">
      <JsonLd
        data={itemListJsonLd(
          "Timed practice tests",
          tests.map((item) => ({
            name: item.title,
            url: practiceTestPath(item.vendorSlug, item.examSlug),
          })),
        )}
      />
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Practice tests" }]} />
      <h1 className="mt-4 text-3xl font-semibold">Practice tests</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Each card is a timed sitting attached to a certification exam. Open it for length, pass
        mark, and checkout. Prefer the exam page if you want format and related credentials first.
      </p>
      {tests.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No published tests"
            description="Published practice tests appear here. Unpublished catalog items stay in admin only."
            actionHref={route("/certifications")}
            actionLabel="Browse certifications"
          />
        </div>
      ) : (
        <section className="mt-8" aria-labelledby="tests-heading">
          <h2 id="tests-heading" className="sr-only">
            All published sittings
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {tests.map((item) => (
              <PracticeTestCard
                key={item.slug}
                examCode={item.examCode}
                href={route(practiceTestPath(item.vendorSlug, item.examSlug))}
                item={{
                  slug: item.slug,
                  title: item.title,
                  summary: item.summary,
                  description: item.description,
                  questionCount: item.questionCount,
                  timeLimitMin: item.timeLimitMin,
                  passingScore: item.passingScore,
                  pricePaise: item.pricePaise,
                  certificationSlug: item.examSlug,
                  ratingAverage: item.ratingAverage,
                  ratingCount: item.ratingCount,
                  isPopular: item.isPopular,
                }}
              />
            ))}
          </div>
        </section>
      )}
    </PageContainer>
  );
}
