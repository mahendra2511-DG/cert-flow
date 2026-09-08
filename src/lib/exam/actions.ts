"use server";

import { auth } from "@/auth";
import { startAttempt, saveSelection, submitAttempt, toggleFlag } from "@/lib/exam/engine";
import { redirect } from "next/navigation";

export async function startPracticeTestAction(vendor: string, exam: string) {
  const session = await auth();
  const attempt = await startAttempt({
    vendorSlug: vendor,
    examSlug: exam,
    userId: session?.user?.id ?? "guest",
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
