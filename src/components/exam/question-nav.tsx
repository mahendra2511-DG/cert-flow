"use client";

import Link from "next/link";
import type { Route } from "next";
import { cn } from "@/lib/utils";
import type { AttemptAnswerState, PublicQuestion } from "@/lib/exam/types";

export function QuestionNav({
  questions,
  answers,
  currentOrder,
  hrefFor,
}: {
  questions: PublicQuestion[];
  answers: AttemptAnswerState[];
  currentOrder: number;
  hrefFor: (order: number) => string;
}) {
  const byId = new Map(answers.map((answer) => [answer.questionId, answer]));

  return (
    <nav aria-label="Question list" className="grid grid-cols-5 gap-2 sm:grid-cols-6">
      {questions.map((question) => {
        const state = byId.get(question.id);
        const answered = (state?.selectedOptionIds.length ?? 0) > 0;
        const flagged = state?.flagged;
        const current = question.order === currentOrder;
        return (
          <Link
            key={question.id}
            href={hrefFor(question.order) as Route}
            className={cn(
              "relative flex h-9 items-center justify-center rounded-lg border text-xs font-medium hover:bg-muted",
              current && "border-primary bg-primary text-primary-foreground hover:bg-primary",
              !current && answered && "bg-accent",
            )}
            aria-current={current ? "step" : undefined}
          >
            {question.order}
            {flagged ? (
              <span className="absolute -top-1 -right-1 size-2 rounded-full bg-amber-500" aria-label="Flagged" />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
