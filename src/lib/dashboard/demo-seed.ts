import { DEMO_USER_ID } from "@/lib/auth/types";
import { getQuestionsForTest } from "@/lib/exam/questions";
import { listAttemptsForUser, saveAttempt } from "@/lib/exam/store";
import type { AttemptRecord } from "@/lib/exam/types";

function buildAttempt(input: {
  id: string;
  examCode: string;
  examName: string;
  vendorSlug: string;
  examSlug: string;
  practiceTestId: string;
  timeLimitMin: number;
  passingScore: number;
  startedAt: string;
  submittedAt: string;
  currentOrder: number;
}): AttemptRecord {
  const questions = getQuestionsForTest(input.practiceTestId);
  const answers = questions.map((question, index) => {
    const correct = question.options.filter((option) => option.isCorrect).map((option) => option.id);
    const firstWrong = question.options.find((option) => !option.isCorrect)?.id;
    const selected =
      index % 4 === 0 && firstWrong ? [firstWrong] : correct.length > 0 ? [correct[0]] : [];
    return {
      questionId: question.id,
      selectedOptionIds: selected,
      flagged: index === 2,
    };
  });

  const scored = answers.reduce(
    (acc, answer) => {
      const question = questions.find((item) => item.id === answer.questionId);
      if (!question) {
        return acc;
      }
      const correctIds = question.options.filter((option) => option.isCorrect).map((option) => option.id);
      const selected = [...answer.selectedOptionIds].sort().join(",");
      const expected = [...correctIds].sort().join(",");
      if (answer.selectedOptionIds.length === 0) {
        acc.unanswered += 1;
      } else if (selected === expected) {
        acc.correct += 1;
      } else {
        acc.incorrect += 1;
      }
      return acc;
    },
    { correct: 0, incorrect: 0, unanswered: 0 },
  );

  const total = questions.length || 1;
  const scorePercent = Math.round((scored.correct / total) * 100);
  const started = new Date(input.startedAt).getTime();
  const submitted = new Date(input.submittedAt).getTime();

  return {
    id: input.id,
    userId: DEMO_USER_ID,
    practiceTestId: input.practiceTestId,
    vendorSlug: input.vendorSlug,
    examSlug: input.examSlug,
    examCode: input.examCode,
    examName: input.examName,
    timeLimitMin: input.timeLimitMin,
    passingScore: input.passingScore,
    status: "SUBMITTED",
    startedAt: input.startedAt,
    endsAt: new Date(started + input.timeLimitMin * 60 * 1000).toISOString(),
    submittedAt: input.submittedAt,
    currentOrder: input.currentOrder,
    answers,
    scorePercent,
    correctCount: scored.correct,
    incorrectCount: scored.incorrect,
    unansweredCount: scored.unanswered,
    timeTakenSec: Math.round((submitted - started) / 1000),
  };
}

export async function ensureDemoAttempts() {
  const existing = await listAttemptsForUser(DEMO_USER_ID);
  if (existing.length > 0) {
    return;
  }

  const attempts = [
    buildAttempt({
      id: "att_demo_saa_1",
      examCode: "SAA-C03",
      examName: "AWS Solutions Architect Associate",
      vendorSlug: "aws",
      examSlug: "saa-c03",
      practiceTestId: "saa-c03-full-length",
      timeLimitMin: 130,
      passingScore: 72,
      startedAt: "2026-08-04T10:15:00.000Z",
      submittedAt: "2026-08-04T11:42:00.000Z",
      currentOrder: 8,
    }),
    buildAttempt({
      id: "att_demo_az_1",
      examCode: "AZ-900",
      examName: "Azure Fundamentals",
      vendorSlug: "microsoft",
      examSlug: "az-900",
      practiceTestId: "az-900-core-drill",
      timeLimitMin: 45,
      passingScore: 70,
      startedAt: "2026-08-12T07:30:00.000Z",
      submittedAt: "2026-08-12T08:08:00.000Z",
      currentOrder: 8,
    }),
  ];

  for (const attempt of attempts) {
    await saveAttempt(attempt);
  }
}
