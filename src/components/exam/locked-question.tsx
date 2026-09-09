import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/page-container";
import { route } from "@/lib/routes";

export function LockedQuestion({
  vendor,
  exam,
  checkoutSlug,
  questionNumber,
}: {
  vendor: string;
  exam: string;
  checkoutSlug: string;
  questionNumber: number;
}) {
  return (
    <PageContainer className="max-w-lg py-16 text-center">
      <p className="text-sm font-medium text-primary">Premium question</p>
      <h1 className="mt-2 text-3xl font-semibold">Question {questionNumber} is locked</h1>
      <p className="mt-3 text-muted-foreground">
        Unlock premium to continue past the free 20. Locked prompts, options, and answers are not
        sent to the browser.
      </p>
      <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Button nativeButton={false} render={<Link href={route(`/checkout/${checkoutSlug}`)} />}>
          Unlock premium
        </Button>
        <Button
          nativeButton={false}
          variant="outline"
          render={<Link href={route(`/practice-test/${vendor}/${exam}/question/20`)} />}
        >
          Back to free questions
        </Button>
      </div>
    </PageContainer>
  );
}
