"use client";

import { cn } from "@/lib/utils";
import type { PublicQuestion } from "@/lib/exam/types";

export function AnswerSelector({
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
  const multiple = question.type === "MULTIPLE_CHOICE";

  function toggle(id: string) {
    if (disabled) return;
    if (!multiple) {
      onChange([id]);
      return;
    }
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((item) => item !== id));
      return;
    }
    onChange([...selectedIds, id]);
  }

  return (
    <fieldset className="space-y-2" disabled={disabled}>
      <legend className="sr-only">
        {multiple ? "Select all that apply" : "Select one answer"}
      </legend>
      {multiple ? (
        <p className="text-xs font-medium text-primary">Select all that apply</p>
      ) : null}
      {question.options.map((option) => {
        const checked = selectedIds.includes(option.id);
        return (
          <label
            key={option.id}
            className={cn(
              "flex cursor-pointer gap-3 rounded-xl border bg-card px-4 py-3 text-sm transition-colors hover:border-primary/40",
              checked && "border-primary bg-accent/50",
            )}
          >
            <input
              type={multiple ? "checkbox" : "radio"}
              name={question.id}
              value={option.id}
              checked={checked}
              onChange={() => toggle(option.id)}
              className="mt-1"
            />
            <span>
              <span className="font-medium">{option.label}.</span> {option.body}
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}
