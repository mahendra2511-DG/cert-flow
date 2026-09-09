import { notFound, redirect } from "next/navigation";
import { ExamWorkspace } from "@/components/exam/exam-workspace";
import { LockedQuestion } from "@/components/exam/locked-question";
import { findActiveAttempt, findExamContext, getSnapshot } from "@/lib/exam/engine";
import { readActor } from "@/lib/auth/actor";
import { createMetadata } from "@/lib/seo";
import { findLivePracticeTest } from "@/lib/admin/catalog-store";

export const metadata = createMetadata({
  title: "Practice test",
  description: "Timed practice sitting.",
  path: "/practice-test",
  noIndex: true,
});

export default async function PracticeQuestionPage({
  params,
  searchParams,
}: {
  params: Promise<{ vendor: string; exam: string; questionNumber: string }>;
  searchParams: Promise<{ attempt?: string }>;
}) {
  const { vendor, exam, questionNumber } = await params;
  const { attempt: attemptIdParam } = await searchParams;
  if (!findExamContext(vendor, exam)) {
    notFound();
  }

  const actor = await readActor();
  if (!actor) {
    redirect(`/practice-test/${vendor}/${exam}/free`);
  }

  const attemptId = attemptIdParam ?? (await findActiveAttempt(actor.id, vendor, exam))?.id;
  if (!attemptId) {
    redirect(`/practice-test/${vendor}/${exam}/free`);
  }

  const snapshot = await getSnapshot(attemptId, actor.id);
  if (!snapshot) {
    notFound();
  }

  if (snapshot.attempt.vendorSlug !== vendor || snapshot.attempt.examSlug !== exam) {
    notFound();
  }

  if (snapshot.attempt.status === "SUBMITTED") {
    redirect(`/practice-test/${vendor}/${exam}/result/${snapshot.attempt.id}`);
  }

  const order = Number.parseInt(questionNumber, 10);
  const catalog = findLivePracticeTest(snapshot.attempt.practiceTestId);
  if ((snapshot.attempt.mode ?? "PREMIUM") === "FREE" && order > snapshot.questions.length) {
    return (
      <LockedQuestion
        vendor={vendor}
        exam={exam}
        checkoutSlug={catalog?.test.slug ?? ""}
        questionNumber={order}
      />
    );
  }

  const safeOrder = snapshot.questions.some((item) => item.order === order)
    ? order
    : snapshot.questions[0]?.order ?? 1;

  if (safeOrder !== order) {
    redirect(`/practice-test/${vendor}/${exam}/question/${safeOrder}?attempt=${snapshot.attempt.id}`);
  }

  return (
    <ExamWorkspace vendor={vendor} exam={exam} questionNumber={safeOrder} snapshot={snapshot} />
  );
}
