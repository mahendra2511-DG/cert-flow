import type { ExamQuestion } from "@/lib/exam/types";

function shuffleInPlace<T>(items: T[], random = Math.random) {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    const current = items[index]!;
    items[index] = items[swap]!;
    items[swap] = current;
  }
  return items;
}

export function pickSittingQuestions(
  bank: ExamQuestion[],
  count: number,
  options?: { randomizeQuestions?: boolean; randomizeOptions?: boolean },
): ExamQuestion[] {
  const pool = [...bank];
  if (options?.randomizeQuestions) {
    shuffleInPlace(pool);
  } else {
    pool.sort((a, b) => a.order - b.order);
  }
  const selected = pool.slice(0, Math.max(0, Math.min(count, pool.length)));
  return selected.map((question, index) => {
    const optionList = [...question.options];
    if (options?.randomizeOptions) {
      shuffleInPlace(optionList);
    }
    return {
      ...question,
      order: index + 1,
      options: optionList,
    };
  });
}
