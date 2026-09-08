import { getExamAdmin, getLiveQuestions, vendorIsPublic } from "@/lib/admin/catalog-store";
import { toPublicQuestion } from "@/lib/exam/questions";
import { calculateAttemptResult } from "@/lib/exam/result-calculator";
import { getAttempt, listAttemptsForExam, saveAttempt } from "@/lib/exam/store";
import { remainingSeconds, timeTakenSeconds } from "@/lib/exam/timer";
import type { AttemptRecord, AttemptResult, ExamSnapshot } from "@/lib/exam/types";

function createId() {
  return `att_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function findExamContext(vendorSlug: string, examSlug: string) {
  const exam = getExamAdmin(vendorSlug, examSlug);
  if (!exam || !exam.isPublished || !vendorIsPublic(vendorSlug)) {
    return null;
  }
  const test = exam.tests.find((item) => item.isPublished) ?? null;
  if (!test) {
    return null;
  }
  return { exam, test };
}

export async function findActiveAttempt(userId: string | null, vendorSlug: string, examSlug: string) {
  const matches = await listAttemptsForExam(userId, vendorSlug, examSlug);
  return (
    matches.find((item) => item.status === "IN_PROGRESS" && remainingSeconds(item.endsAt) > 0) ?? null
  );
}

export async function startAttempt(input: {
  vendorSlug: string;
  examSlug: string;
  userId: string | null;
}): Promise<AttemptRecord> {
  const context = findExamContext(input.vendorSlug, input.examSlug);
  if (!context) {
    throw new Error("Exam not found");
  }

  const existing = (await listAttemptsForExam(input.userId, input.vendorSlug, input.examSlug)).find(
    (item) => item.status === "IN_PROGRESS" && remainingSeconds(item.endsAt) > 0,
  );
  if (existing) {
    return existing;
  }

  const now = new Date();
  const endsAt = new Date(now.getTime() + context.test.timeLimitMin * 60 * 1000);
  const questions = getLiveQuestions(context.test.slug);
  const attempt: AttemptRecord = {
    id: createId(),
    userId: input.userId,
    practiceTestId: context.test.slug,
    vendorSlug: input.vendorSlug,
    examSlug: input.examSlug,
    examCode: context.exam.code,
    examName: context.exam.name,
    timeLimitMin: context.test.timeLimitMin,
    passingScore: context.test.passingScore,
    status: "IN_PROGRESS",
    startedAt: now.toISOString(),
    endsAt: endsAt.toISOString(),
    submittedAt: null,
    currentOrder: 1,
    answers: questions.map((question) => ({
      questionId: question.id,
      selectedOptionIds: [],
      flagged: false,
    })),
    scorePercent: null,
    correctCount: null,
    incorrectCount: null,
    unansweredCount: null,
    timeTakenSec: null,
  };
  await saveAttempt(attempt);
  return attempt;
}

export async function getSnapshot(attemptId: string): Promise<ExamSnapshot | null> {
  const attempt = await maybeExpire(attemptId);
  if (!attempt) {
    return null;
  }
  const questions = getLiveQuestions(attempt.practiceTestId).map(toPublicQuestion);
  return {
    attempt,
    questions,
    remainingSeconds: remainingSeconds(attempt.endsAt),
  };
}

export async function saveSelection(attemptId: string, questionId: string, selectedOptionIds: string[]) {
  const attempt = await requireInProgress(attemptId);
  const question = getLiveQuestions(attempt.practiceTestId).find((item) => item.id === questionId);
  if (!question) {
    throw new Error("Question not found");
  }
  const unique = [...new Set(selectedOptionIds)];
  const nextIds =
    question.type === "SINGLE_CHOICE" ? unique.slice(-1) : unique.filter((id) => question.options.some((option) => option.id === id));
  attempt.answers = attempt.answers.map((answer) =>
    answer.questionId === questionId ? { ...answer, selectedOptionIds: nextIds } : answer,
  );
  attempt.currentOrder = question.order;
  await saveAttempt(attempt);
  return attempt;
}

export async function toggleFlag(attemptId: string, questionId: string) {
  const attempt = await requireInProgress(attemptId);
  attempt.answers = attempt.answers.map((answer) =>
    answer.questionId === questionId ? { ...answer, flagged: !answer.flagged } : answer,
  );
  await saveAttempt(attempt);
  return attempt;
}

export async function submitAttempt(attemptId: string): Promise<AttemptResult> {
  const attempt = await getAttempt(attemptId);
  if (!attempt) {
    throw new Error("Attempt not found");
  }
  if (attempt.status === "SUBMITTED" && attempt.scorePercent !== null) {
    return toResult(attempt);
  }

  const questions = getLiveQuestions(attempt.practiceTestId);
  const scored = calculateAttemptResult(questions, attempt.answers);
  const submittedAt = new Date().toISOString();
  const next: AttemptRecord = {
    ...attempt,
    status: "SUBMITTED",
    submittedAt,
    scorePercent: scored.scorePercent,
    correctCount: scored.correctCount,
    incorrectCount: scored.incorrectCount,
    unansweredCount: scored.unansweredCount,
    timeTakenSec: timeTakenSeconds(attempt.startedAt, submittedAt),
  };
  await saveAttempt(next);
  return toResult(next);
}

export async function getResult(attemptId: string): Promise<AttemptResult | null> {
  const attempt = await maybeExpire(attemptId);
  if (!attempt || attempt.status !== "SUBMITTED") {
    return attempt ? toResult(attempt) : null;
  }
  return toResult(attempt);
}

async function maybeExpire(attemptId: string) {
  const attempt = await getAttempt(attemptId);
  if (!attempt) {
    return null;
  }
  if (attempt.status === "IN_PROGRESS" && remainingSeconds(attempt.endsAt) <= 0) {
    return (await submitAttempt(attempt.id)).attempt;
  }
  return attempt;
}

async function requireInProgress(attemptId: string) {
  const attempt = await maybeExpire(attemptId);
  if (!attempt) {
    throw new Error("Attempt not found");
  }
  if (attempt.status !== "IN_PROGRESS") {
    throw new Error("Attempt already submitted");
  }
  return attempt;
}

function toResult(attempt: AttemptRecord): AttemptResult {
  const questions = getLiveQuestions(attempt.practiceTestId);
  const scored = calculateAttemptResult(questions, attempt.answers);
  const byId = new Map(attempt.answers.map((answer) => [answer.questionId, answer]));
  return {
    attempt,
    passed: (attempt.scorePercent ?? scored.scorePercent) >= attempt.passingScore,
    review: questions.map((question) => {
      const selected = byId.get(question.id)?.selectedOptionIds ?? [];
      const result = scored.review.find((item) => item.question.id === question.id)?.result ?? "unanswered";
      return {
        ...toPublicQuestion(question),
        explanation: question.explanation,
        correctOptionIds: question.options.filter((option) => option.isCorrect).map((option) => option.id),
        selectedOptionIds: selected,
        flagged: byId.get(question.id)?.flagged ?? false,
        result,
      };
    }),
  };
}
