import { notFound } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { startFreePracticeAction } from "@/lib/exam/actions";
import { findActiveAttempt, findExamContext } from "@/lib/exam/engine";
import { readActor } from "@/lib/auth/actor";
import { createMetadata } from "@/lib/seo";
import { CertificationSelector } from "@/components/catalog/certification-selector";
import { getPublicExams, getPublicVendors } from "@/lib/admin/catalog-store";

export const metadata = createMetadata({
  title: "Start 20 free questions",
  description: "Practice the first 20 questions without payment.",
  path: "/practice-test",
  noIndex: true,
});

export default async function FreePracticeStartPage({
  params,
}: {
  params: Promise<{ vendor: string; exam: string }>;
}) {
  const { vendor, exam } = await params;
  const context = findExamContext(vendor, exam);
  if (!context) {
    notFound();
  }
  const actor = await readActor();
  const active = actor ? await findActiveAttempt(actor.id, vendor, exam, "FREE") : null;
  const vendors = getPublicVendors().map((item) => ({ slug: item.slug, name: item.name }));
  const exams = getPublicExams().map((item) => ({
    vendorSlug: item.vendorSlug,
    slug: item.slug,
    code: item.code,
    name: item.name,
  }));

  return (
    <PageContainer className="max-w-2xl py-16">
      <p className="text-sm font-medium text-primary">{context.exam.code}</p>
      <h1 className="mt-2 text-3xl font-semibold">Start 20 free questions</h1>
      <p className="mt-2 text-muted-foreground">
        Practice the first {context.exam.freeQuestionLimit ?? 20} questions of {context.exam.name}{" "}
        without paying. Question 21 and the premium PDF stay locked.
      </p>
      {active ? (
        <p className="mt-4 rounded-xl border bg-muted/40 px-4 py-3 text-sm">
          You have an in-progress free sitting. Continue resumes your answers.
        </p>
      ) : null}
      <form action={startFreePracticeAction.bind(null, vendor, exam)} className="mt-8">
        <Button type="submit" className="w-full" size="lg">
          {active ? "Continue free practice" : "Start free practice"}
        </Button>
      </form>
      <div className="mt-12">
        <p className="mb-3 text-sm font-medium">Or switch exam</p>
        <CertificationSelector vendors={vendors} exams={exams} />
      </div>
    </PageContainer>
  );
}
