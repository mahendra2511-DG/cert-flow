import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { startPracticeTestAction } from "@/lib/exam/actions";
import { userOwnsExam } from "@/lib/commerce/checkout";
import { findActiveAttempt, findExamContext } from "@/lib/exam/engine";
import { createMetadata } from "@/lib/seo";
import { route } from "@/lib/routes";

export const metadata = createMetadata({
  title: "Premium practice test",
  description: "Timed full-bank sitting for paid learners.",
  path: "/practice-test",
  noIndex: true,
});

export default async function PremiumPracticeStartPage({
  params,
}: {
  params: Promise<{ vendor: string; exam: string }>;
}) {
  const { vendor, exam } = await params;
  const context = findExamContext(vendor, exam);
  if (!context) {
    notFound();
  }
  const session = await auth();
  if (!session?.user?.id) {
    redirect(route(`/sign-in?callbackUrl=/practice-test/${vendor}/${exam}/premium`));
  }
  const owned = await userOwnsExam(session.user.id, vendor, exam);
  if (!owned) {
    redirect(route(`/checkout/${context.test.slug}`));
  }
  const active = await findActiveAttempt(session.user.id, vendor, exam, "PREMIUM");

  return (
    <PageContainer className="max-w-lg py-16">
      <p className="text-sm font-medium text-primary">Premium unlocked</p>
      <h1 className="mt-2 text-3xl font-semibold">Start the full practice test</h1>
      <p className="mt-2 text-muted-foreground">
        This sitting uses the configured premium length, a timer, and shuffled items. Explanations
        appear after you submit.
      </p>
      {active ? (
        <p className="mt-4 rounded-xl border bg-muted/40 px-4 py-3 text-sm">
          Continue resumes your in-progress premium attempt.
        </p>
      ) : null}
      <form action={startPracticeTestAction.bind(null, vendor, exam)} className="mt-8">
        <Button type="submit" className="w-full" size="lg">
          {active ? "Continue premium test" : "Begin premium test"}
        </Button>
      </form>
    </PageContainer>
  );
}
