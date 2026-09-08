import { PracticeTestCard } from "@/components/catalog/cards";
import { EmptyState } from "@/components/ui-patterns/empty-state";
import { listPublicPracticeTests } from "@/lib/admin/catalog-store";
import { createMetadata } from "@/lib/seo";
import { route } from "@/lib/routes";

export const metadata = createMetadata({
  title: "Practice tests",
  description: "Timed practice exams with scores, retakes, and explanations after purchase.",
  path: "/practice-tests",
});

export default function PracticeTestsPage() {
  const tests = listPublicPracticeTests();
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold">Practice tests</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Each test lists length, passing score, and INR price. Open a test for the purchase path and
        exam format.
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
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {tests.map((item) => (
            <PracticeTestCard
              key={item.slug}
              examCode={item.examCode}
              href={route(`/practice-tests/${item.slug}`)}
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
      )}
    </div>
  );
}
