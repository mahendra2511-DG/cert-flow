import type { AttemptAnswerState, ExamQuestion } from "@/lib/exam/types";

function sameSet(a: string[], b: string[]) {
  if (a.length !== b.length) {
    return false;
  }
  const left = [...a].sort();
  const right = [...b].sort();
  return left.every((value, index) => value === right[index]);
}

export function evaluateQuestion(question: ExamQuestion, selectedOptionIds: string[]) {
  const correctIds = question.options.filter((option) => option.isCorrect).map((option) => option.id);
  if (selectedOptionIds.length === 0) {
    return "unanswered" as const;
  }
  return sameSet(selectedOptionIds, correctIds) ? ("correct" as const) : ("incorrect" as const);
}

export function calculateAttemptResult(questions: ExamQuestion[], answers: AttemptAnswerState[]) {
  const byId = new Map(answers.map((answer) => [answer.questionId, answer]));
  let correctCount = 0;
  let incorrectCount = 0;
  let unansweredCount = 0;

  const review = questions.map((question) => {
    const selected = byId.get(question.id)?.selectedOptionIds ?? [];
    const result = evaluateQuestion(question, selected);
    if (result === "correct") correctCount += 1;
    if (result === "incorrect") incorrectCount += 1;
    if (result === "unanswered") unansweredCount += 1;
    return { question, selected, result };
  });

  const scorePercent = questions.length === 0 ? 0 : Math.round((correctCount / questions.length) * 100);

  return {
    correctCount,
    incorrectCount,
    unansweredCount,
    scorePercent,
    review,
  };
}

export function answeredCount(answers: AttemptAnswerState[]) {
  return answers.filter((answer) => answer.selectedOptionIds.length > 0).length;
}

export function flaggedCount(answers: AttemptAnswerState[]) {
  return answers.filter((answer) => answer.flagged).length;
}
