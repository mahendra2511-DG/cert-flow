import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getAttempt } from "@/lib/exam/store";
import { createMetadata } from "@/lib/seo";
import { route } from "@/lib/routes";

export const metadata = createMetadata({
  title: "Results",
  description: "Score and explanations after a practice test.",
  path: "/results",
  noIndex: true,
});

export default async function LegacyResultsPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(route("/sign-in?callbackUrl=/dashboard/attempts"));
  }
  const { attemptId } = await params;
  const attempt = await getAttempt(attemptId);
  if (!attempt || attempt.userId !== session.user.id) {
    notFound();
  }
  redirect(route(`/practice-test/${attempt.vendorSlug}/${attempt.examSlug}/result/${attempt.id}`));
}
