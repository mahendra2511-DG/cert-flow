import { freeQuestionLimit, premiumSittingSize, type PracticeMode } from "@/lib/access";
import { getExamAdmin, getLiveQuestions, vendorIsPublic } from "@/lib/admin/catalog-store";
import { pickSittingQuestions } from "@/lib/exam/pick";
import { toPublicQuestion } from "@/lib/exam/questions";
import { calculateAttemptResult } from "@/lib/exam/result-calculator";
import { getAttempt, listAttemptsForExam, saveAttempt } from "@/lib/exam/store";
import { remainingSeconds, timeTakenSeconds } from "@/lib/exam/timer";
import type { AttemptRecord, AttemptResult, ExamQuestion, ExamSnapshot } from "@/lib/exam/types";

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

export function examFreeLimit(vendorSlug: string, examSlug: string) {
  const context = findExamContext(vendorSlug, examSlug);
  return freeQuestionLimit(context?.exam.freeQuestionLimit);
}

function sittingQuestionsFor(attempt: AttemptRecord): ExamQuestion[] {
  const bank = getLiveQuestions(attempt.practiceTestId);
  const byId = new Map(bank.map((question) => [question.id, question]));
  const sitting: ExamQuestion[] = [];
  attempt.answers.forEach((item, index) => {
    const question = byId.get(item.questionId);
    if (!question) return;
    sitting.push({ ...question, order: index + 1 });
  });
  return sitting;
}

export async function findActiveAttempt(
  userId: string | null,
  vendorSlug: string,
  examSlug: string,
  mode?: PracticeMode,
) {
  const matches = await listAttemptsForExam(userId, vendorSlug, examSlug);
  return (
    matches.find((item) => {
      const sameMode = mode ? (item.mode ?? "PREMIUM") === mode : true;
      return sameMode && item.status === "IN_PROGRESS" && remainingSeconds(item.endsAt) > 0;
    }) ?? null
  );
}

export async function startAttempt(input: {
  vendorSlug: string;
  examSlug: string;
  userId: string;
  mode: PracticeMode;
}): Promise<AttemptRecord> {
  const context = findExamContext(input.vendorSlug, input.examSlug);
  if (!context) {
    throw new Error("Exam not found");
  }

  const existing = await findActiveAttempt(input.userId, input.vendorSlug, input.examSlug, input.mode);
  if (existing) {
    return existing;
  }

  const bank = getLiveQuestions(context.test.slug);
  const count =
    input.mode === "FREE"
      ? Math.min(freeQuestionLimit(context.exam.freeQuestionLimit), bank.length)
      : premiumSittingSize(bank.length, context.exam.premiumQuestionCount ?? context.test.questionCount);

  const sitting = pickSittingQuestions(bank, count, {
    randomizeQuestions: input.mode === "PREMIUM",
    randomizeOptions: input.mode === "PREMIUM",
  });

  const now = new Date();
  const minutes = input.mode === "FREE" ? Math.min(context.test.timeLimitMin, 40) : context.test.timeLimitMin;
  const endsAt = new Date(now.getTime() + minutes * 60 * 1000);
  const attempt: AttemptRecord = {
    id: createId(),
    userId: input.userId,
    practiceTestId: context.test.slug,
    vendorSlug: input.vendorSlug,
    examSlug: input.examSlug,
    examCode: context.exam.code,
    examName: context.exam.name,
    mode: input.mode,
    timeLimitMin: minutes,
    passingScore: context.test.passingScore,
    status: "IN_PROGRESS",
    startedAt: now.toISOString(),
    endsAt: endsAt.toISOString(),
    submittedAt: null,
    currentOrder: 1,
    answers: sitting.map((question) => ({
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

export async function getSnapshot(attemptId: string, userId: string): Promise<ExamSnapshot | null> {
  const attempt = await maybeExpire(attemptId);
  if (!attempt || !userId || attempt.userId !== userId) {
    return null;
  }
  const questions = sittingQuestionsFor(attempt).map(toPublicQuestion);
  return {
    attempt: { ...attempt, mode: attempt.mode ?? "PREMIUM" },
    questions,
    remainingSeconds: remainingSeconds(attempt.endsAt),
  };
}

export async function saveSelection(attemptId: string, questionId: string, selectedOptionIds: string[]) {
  const attempt = await requireInProgress(attemptId);
  const sitting = sittingQuestionsFor(attempt);
  const question = sitting.find((item) => item.id === questionId);
  if (!question) {
    throw new Error("Question not found");
  }
  const unique = [...new Set(selectedOptionIds)];
  const nextIds =
    question.type === "SINGLE_CHOICE"
      ? unique.slice(-1)
      : unique.filter((id) => question.options.some((option) => option.id === id));
  attempt.answers = attempt.answers.map((answer) =>
    answer.questionId === questionId ? { ...answer, selectedOptionIds: nextIds } : answer,
  );
  attempt.currentOrder = question.order;
  await saveAttempt(attempt);
  return attempt;
}

export async function toggleFlag(attemptId: string, questionId: string) {
  const attempt = await requireInProgress(attemptId);
  if (!attempt.answers.some((item) => item.questionId === questionId)) {
    throw new Error("Question not found");
  }
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

  const questions = sittingQuestionsFor(attempt);
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

export async function getResult(attemptId: string, userId: string): Promise<AttemptResult | null> {
  const attempt = await maybeExpire(attemptId);
  if (!attempt || !userId || attempt.userId !== userId) {
    return null;
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
  const questions = sittingQuestionsFor(attempt);
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

export function publicFreeQuestions(vendorSlug: string, examSlug: string) {
  const context = findExamContext(vendorSlug, examSlug);
  if (!context) {
    return null;
  }
  const bank = getLiveQuestions(context.test.slug);
  const limit = Math.min(freeQuestionLimit(context.exam.freeQuestionLimit), bank.length);
  return pickSittingQuestions(bank, limit, { randomizeQuestions: false, randomizeOptions: false }).map(
    toPublicQuestion,
  );
}

export function publicPremiumQuestions(vendorSlug: string, examSlug: string) {
  const context = findExamContext(vendorSlug, examSlug);
  if (!context) {
    return null;
  }
  const bank = getLiveQuestions(context.test.slug);
  const count = premiumSittingSize(bank.length, context.exam.premiumQuestionCount ?? context.test.questionCount);
  return pickSittingQuestions(bank, count, { randomizeQuestions: false, randomizeOptions: false }).map(
    toPublicQuestion,
  );
}
