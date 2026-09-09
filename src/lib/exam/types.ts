export type QuestionType = "SINGLE_CHOICE" | "MULTIPLE_CHOICE";

export type ExamOption = {
  id: string;
  label: string;
  body: string;
  isCorrect: boolean;
};

export type ExamQuestion = {
  id: string;
  order: number;
  type: QuestionType;
  prompt: string;
  explanation: string;
  options: ExamOption[];
  difficulty?: string;
  category?: string;
  tags?: string[];
};

export type PublicOption = Omit<ExamOption, "isCorrect">;

export type PublicQuestion = {
  id: string;
  order: number;
  type: QuestionType;
  prompt: string;
  options: PublicOption[];
};

export type AttemptAnswerState = {
  questionId: string;
  selectedOptionIds: string[];
  flagged: boolean;
};

export type AttemptRecord = {
  id: string;
  userId: string | null;
  practiceTestId: string;
  vendorSlug: string;
  examSlug: string;
  examCode: string;
  examName: string;
  mode: "FREE" | "PREMIUM";
  timeLimitMin: number;
  passingScore: number;
  status: "IN_PROGRESS" | "SUBMITTED";
  startedAt: string;
  endsAt: string;
  submittedAt: string | null;
  currentOrder: number;
  answers: AttemptAnswerState[];
  scorePercent: number | null;
  correctCount: number | null;
  incorrectCount: number | null;
  unansweredCount: number | null;
  timeTakenSec: number | null;
};

export type ExamSnapshot = {
  attempt: AttemptRecord;
  questions: PublicQuestion[];
  remainingSeconds: number;
};

export type ReviewQuestion = PublicQuestion & {
  explanation: string;
  correctOptionIds: string[];
  selectedOptionIds: string[];
  flagged: boolean;
  result: "correct" | "incorrect" | "unanswered";
};

export type AttemptResult = {
  attempt: AttemptRecord;
  review: ReviewQuestion[];
  passed: boolean;
};
