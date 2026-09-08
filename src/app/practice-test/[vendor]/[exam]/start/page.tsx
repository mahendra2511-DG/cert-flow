import { auth } from "@/auth";
import { startPracticeTestAction } from "@/lib/exam/actions";
import { findActiveAttempt, findExamContext } from "@/lib/exam/engine";
import { notFound } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Start practice test",
  description: "Begin or continue a timed practice sitting.",
  path: "/practice-test",
  noIndex: true,
});

export default async function StartPracticeTestPage({
  params,
}: {
  params: Promise<{ vendor: string; exam: string }>;
}) {
  const { vendor, exam } = await params;
  if (!findExamContext(vendor, exam)) {
    notFound();
  }
  const session = await auth();
  const active = await findActiveAttempt(session?.user?.id ?? "guest", vendor, exam);

  return (
    <PageContainer className="max-w-lg py-16">
      <h1 className="text-3xl font-semibold">Start the sitting</h1>
      <p className="mt-2 text-muted-foreground">
        The timer starts when you begin. Answers save as you select them. If time reaches zero, the
        test submits automatically.
      </p>
      {active ? (
        <p className="mt-4 rounded-xl border bg-muted/40 px-4 py-3 text-sm">
          You have an in-progress attempt. Continue resumes that timer and answers.
        </p>
      ) : null}
      <form action={startPracticeTestAction.bind(null, vendor, exam)} className="mt-8">
        <Button type="submit" className="w-full">
          {active ? "Continue attempt" : "Begin timed test"}
        </Button>
      </form>
    </PageContainer>
  );
}
