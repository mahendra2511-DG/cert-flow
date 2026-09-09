import Link from "next/link";
import { notFound } from "next/navigation";
import type { Route } from "next";
import { PageContainer } from "@/components/layout/page-container";
import { ResultReview, ResultSummary } from "@/components/exam/result-views";
import { Button } from "@/components/ui/button";
import { PremiumPdfCta } from "@/components/commerce/premium-pdf-cta";
import { findExamContext, getResult } from "@/lib/exam/engine";
import { readActor } from "@/lib/auth/actor";
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
  const context = findExamContext(vendor, exam);
  if (!context) {
    notFound();
  }
  const actor = await readActor();
  if (!actor) {
    notFound();
  }
  const result = await getResult(attemptId, actor.id);
  if (!result || result.attempt.vendorSlug !== vendor || result.attempt.examSlug !== exam) {
    notFound();
  }
  if (result.attempt.status !== "SUBMITTED") {
    notFound();
  }

  const free = (result.attempt.mode ?? "PREMIUM") === "FREE";
  const retakeHref = (
    free ? `/practice-test/${vendor}/${exam}/free` : `/practice-test/${vendor}/${exam}/premium`
  ) as Route;

  return (
    <PageContainer className="py-10">
      <p className="text-sm text-muted-foreground">
        {result.attempt.examCode} · {result.attempt.examName}
        {free ? " · Free sitting" : " · Premium sitting"}
      </p>
      <h1 className="mt-2 text-3xl font-semibold">Results</h1>
      {free ? (
        <p className="mt-3 max-w-2xl text-muted-foreground">
          You have completed your 20 free questions. Want more questions? Unlock the full practice
          test and premium PDF.
        </p>
      ) : null}
      <div className="mt-8">
        <ResultSummary result={result} />
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        <Button nativeButton={false} render={<Link href={retakeHref} />}>
          {free ? "Retake free set" : "Retake test"}
        </Button>
        {free ? (
          <Button nativeButton={false} variant="outline" render={<Link href={`/checkout/${context.test.slug}` as Route} />}>
            Unlock premium
          </Button>
        ) : null}
      </div>
      <div className="mt-8 max-w-lg">
        <PremiumPdfCta vendor={vendor} exam={exam} checkoutSlug={context.test.slug} />
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
