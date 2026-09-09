import { ExamCard } from "@/components/catalog/exam-card";
import { PageContainer } from "@/components/layout/page-container";
import { EmptyState } from "@/components/ui-patterns/empty-state";
import { createMetadata } from "@/lib/seo";
import { listExams } from "@/lib/catalog/repository";

export const metadata = createMetadata({
  title: "Premium practice tests",
  description: "Unlock full question banks, premium sittings, and downloadable PDFs.",
  path: "/premium-tests",
});

export default async function PremiumTestsPage() {
  const result = await listExams({ sort: "popular", pageSize: 24 });
  return (
    <PageContainer className="py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Premium tests</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Premium access unlocks questions 21+, timed full sittings, explanations, and a protected PDF
        download after Razorpay verification.
      </p>
      {result.items.length === 0 ? (
        <EmptyState
          title="No premium tests published"
          description="Check back after an admin publishes exams."
          actionHref="/certifications"
          actionLabel="Browse catalog"
        />
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {result.items.map((exam) => (
            <li key={`${exam.vendorSlug}-${exam.examSlug}`}>
              <ExamCard exam={exam} />
            </li>
          ))}
        </ul>
      )}
    </PageContainer>
  );
}
