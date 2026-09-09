export const DEFAULT_FREE_QUESTION_LIMIT = 20;

export type PracticeMode = "FREE" | "PREMIUM";

export type ProductKind = "FREE_PRACTICE" | "QUESTION_BANK" | "PREMIUM_PDF" | "BUNDLE";

export function freeQuestionLimit(value?: number | null) {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.floor(value);
  }
  return DEFAULT_FREE_QUESTION_LIMIT;
}

export function premiumSittingSize(questionBankLength: number, configured?: number | null) {
  if (typeof configured === "number" && configured > 0) {
    return Math.min(questionBankLength, Math.floor(configured));
  }
  return questionBankLength;
}
