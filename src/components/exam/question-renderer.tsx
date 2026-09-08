"use client";

import type { PublicQuestion } from "@/lib/exam/types";
import { AnswerSelector } from "@/components/exam/answer-selector";

export function QuestionRenderer({
  question,
  selectedIds,
  onChange,
  disabled,
}: {
  question: PublicQuestion;
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
}) {
  return (
    <article>
      <p className="text-sm font-medium text-muted-foreground">Question {question.order}</p>
      <h2 className="mt-2 text-xl font-semibold leading-snug">{question.prompt}</h2>
      <div className="mt-6">
        <AnswerSelector
          question={question}
          selectedIds={selectedIds}
          onChange={onChange}
          disabled={disabled}
        />
      </div>
    </article>
  );
}
