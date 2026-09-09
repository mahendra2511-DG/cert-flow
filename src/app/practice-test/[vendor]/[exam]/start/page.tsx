import { auth } from "@/auth";
import { startPracticeTestAction } from "@/lib/exam/actions";
import { userOwnsExam } from "@/lib/commerce/checkout";
import { findActiveAttempt, findExamContext } from "@/lib/exam/engine";
import { notFound, redirect } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { createMetadata } from "@/lib/seo";
import { route } from "@/lib/routes";

export const metadata = createMetadata({
  title: "Start practice test",
  description: "Begin or continue a timed practice sitting.",
  path: "/practice-test",
  noIndex: true,
});

export default async function StartPracticeTestPage({
  params,
  searchParams,
}: {
  params: Promise<{ vendor: string; exam: string }>;
  searchParams: Promise<{ purchased?: string; already?: string }>;
}) {
  const { vendor, exam } = await params;
  const context = findExamContext(vendor, exam);
  if (!context) {
    notFound();
  }
  const session = await auth();
  if (!session?.user?.id) {
    redirect(route(`/practice-test/${vendor}/${exam}/free`));
  }

  const owned = await userOwnsExam(session.user.id, vendor, exam);
  if (!owned) {
    redirect(route(`/practice-test/${vendor}/${exam}/free`));
  }

  const query = await searchParams;
  const active = await findActiveAttempt(session.user.id, vendor, exam);

  return (
    <PageContainer className="max-w-lg py-16">
      {query.purchased === "1" ? (
        <p className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Payment verified. This practice test is unlocked on your account — start whenever you are
          ready.
        </p>
      ) : null}
      {query.already === "1" ? (
        <p className="mb-6 rounded-xl border bg-muted/50 px-4 py-3 text-sm">
          You already own this test. No additional payment was taken.
        </p>
      ) : null}
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
