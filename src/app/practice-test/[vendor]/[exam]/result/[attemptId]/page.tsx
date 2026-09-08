import Link from "next/link";
import { notFound } from "next/navigation";
import type { Route } from "next";
import { PageContainer } from "@/components/layout/page-container";
import { ResultReview, ResultSummary } from "@/components/exam/result-views";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";
import { findExamContext, getResult } from "@/lib/exam/engine";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Practice test results",
  description: "Score, pass/fail, and per-question review.",
  path: "/practice-test",
  noIndex: true,
});

export default async function PracticeResultPage({
  params,
}: {
  params: Promise<{ vendor: string; exam: string; attemptId: string }>;
}) {
  const { vendor, exam, attemptId } = await params;
  if (!findExamContext(vendor, exam)) {
    notFound();
  }
  const session = await auth();
  if (!session?.user?.id) {
    notFound();
  }
  const result = await getResult(attemptId, session.user.id);
  if (!result || result.attempt.vendorSlug !== vendor || result.attempt.examSlug !== exam) {
    notFound();
  }
  if (result.attempt.status !== "SUBMITTED") {
    notFound();
  }

  const retakeHref = `/practice-test/${vendor}/${exam}/start` as Route;

  return (
    <PageContainer className="py-10">
      <p className="text-sm text-muted-foreground">
        {result.attempt.examCode} · {result.attempt.examName}
      </p>
      <h1 className="mt-2 text-3xl font-semibold">Results</h1>
      <div className="mt-8">
        <ResultSummary result={result} />
      </div>
      <div className="mt-6">
        <Button nativeButton={false} render={<Link href={retakeHref} />}>
          Retake test
        </Button>
      </div>
      <section className="mt-12" aria-labelledby="review-heading">
        <h2 id="review-heading" className="text-2xl font-semibold">
          Question-by-question review
        </h2>
        <div className="mt-4">
          <ResultReview result={result} />
        </div>
      </section>
    </PageContainer>
  );
}
