import { answeredCount } from "@/lib/exam/result-calculator";
import type { AttemptAnswerState } from "@/lib/exam/types";

export function progressPercent(answered: number, total: number) {
  if (total === 0) {
    return 0;
  }
  return Math.round((answered / total) * 100);
}

export function attemptProgress(answers: AttemptAnswerState[], totalQuestions: number) {
  const answered = answeredCount(answers);
  return {
    answered,
    total: totalQuestions,
    percent: progressPercent(answered, totalQuestions),
  };
}
