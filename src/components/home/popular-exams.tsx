import { ExamCard } from "@/components/catalog/exam-card";
import { PageContainer, SectionHeader } from "@/components/layout/page-container";
import { EmptyState } from "@/components/ui-patterns/empty-state";
import type { ExamListing } from "@/lib/catalog/repository";
import Link from "next/link";

export function PopularExams({ exams }: { exams: ExamListing[] }) {
  return (
    <section className="border-y bg-muted/20 py-16 sm:py-20" aria-labelledby="popular-exams-heading">
      <PageContainer>
        <SectionHeader
          titleId="popular-exams-heading"
          eyebrow="Popular"
          title="Popular certification exams"
          description="Start with 20 free questions, then unlock the remaining bank when you are ready."
          action={
            <Link href="/certifications" className="text-sm font-medium text-primary hover:underline">
              Browse all
            </Link>
          }
        />
        {exams.length === 0 ? (
          <EmptyState
            title="No popular exams yet"
            description="Publish exams in admin to feature them here."
            actionHref="/certifications"
            actionLabel="Open catalog"
          />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {exams.map((exam) => (
              <li key={`${exam.vendorSlug}-${exam.examSlug}`}>
                <ExamCard exam={exam} />
              </li>
            ))}
          </ul>
        )}
      </PageContainer>
    </section>
  );
}
