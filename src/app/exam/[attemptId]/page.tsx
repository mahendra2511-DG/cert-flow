import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getAttempt } from "@/lib/exam/store";
import { createMetadata } from "@/lib/seo";
import { route } from "@/lib/routes";

export const metadata = createMetadata({
  title: "Exam",
  description: "Timed online exam.",
  path: "/exam",
  noIndex: true,
});

export default async function LegacyExamPage({
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
  if (attempt.status === "SUBMITTED") {
    redirect(route(`/practice-test/${attempt.vendorSlug}/${attempt.examSlug}/result/${attempt.id}`));
  }
  redirect(
    route(`/practice-test/${attempt.vendorSlug}/${attempt.examSlug}/question/${attempt.currentOrder}?attempt=${attempt.id}`),
  );
}
