"use server";

import { auth } from "@/auth";
import { startAttempt, saveSelection, submitAttempt, toggleFlag, findExamContext } from "@/lib/exam/engine";
import { userOwnsExam } from "@/lib/commerce/checkout";
import { redirect } from "next/navigation";
import { route } from "@/lib/routes";

export async function startPracticeTestAction(vendor: string, exam: string) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(route(`/sign-in?callbackUrl=/practice-test/${vendor}/${exam}/start`));
  }
  const context = findExamContext(vendor, exam);
  if (!context) {
    redirect(route("/practice-tests"));
  }
  if (!(await userOwnsExam(session.user.id, vendor, exam))) {
    redirect(route(`/checkout/${context.test.slug}`));
  }
  const attempt = await startAttempt({
    vendorSlug: vendor,
    examSlug: exam,
    userId: session.user.id,
  });
  redirect(`/practice-test/${vendor}/${exam}/question/1?attempt=${attempt.id}`);
}

export async function saveAnswerAction(attemptId: string, questionId: string, selectedOptionIds: string[]) {
  await saveSelection(attemptId, questionId, selectedOptionIds);
}

export async function toggleFlagAction(attemptId: string, questionId: string) {
  await toggleFlag(attemptId, questionId);
}

export async function submitAttemptAction(vendor: string, exam: string, attemptId: string) {
  await submitAttempt(attemptId);
  redirect(`/practice-test/${vendor}/${exam}/result/${attemptId}`);
}
