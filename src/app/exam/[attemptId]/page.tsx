import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Exam",
  description: "Timed online exam shell.",
  path: "/exam",
  noIndex: true,
});

export default async function ExamPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <p className="text-sm text-muted-foreground">Attempt {attemptId}</p>
      <h1 className="mt-2 text-3xl font-semibold">Online exam</h1>
      <p className="mt-2 text-muted-foreground">
        This is the exam-taking shell. Question navigation, timers, and persistence will attach to
        the Attempt model in a later slice.
      </p>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Sample item</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>Which principle most directly reduces the blast radius of a failed deploy?</p>
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            <li>A single shared production account for every team</li>
            <li>Isolated environments and least-privilege roles</li>
            <li>Turning off logging to save cost</li>
          </ul>
          <Button
            nativeButton={false}
            render={<Link href={`/results/${attemptId}`} />}
            className="mt-4"
          >
            Submit sample attempt
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
