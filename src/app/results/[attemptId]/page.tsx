import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Results",
  description: "Score and explanations after a practice test.",
  path: "/results",
  noIndex: true,
});

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <p className="text-sm text-muted-foreground">Attempt {attemptId}</p>
      <h1 className="mt-2 text-3xl font-semibold">Results</h1>
      <p className="mt-2 text-muted-foreground">
        Score cards and per-question explanations will render here from AttemptAnswer rows.
      </p>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Sample score</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-4xl font-semibold">72%</p>
          <p className="text-sm text-muted-foreground">
            Passing mark 70%. Explanation: isolating environments limits how far a failed change can
            travel — that is why the second option is stronger.
          </p>
          <Button nativeButton={false} render={<Link href="/library" />} variant="outline">
            Return to library
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
