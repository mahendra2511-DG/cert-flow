import { Badge } from "@/components/ui/badge";
import { formatDuration } from "@/lib/exam/timer";
import type { AttemptResult } from "@/lib/exam/types";
import { cn } from "@/lib/utils";

export function ResultSummary({ result }: { result: AttemptResult }) {
  const { attempt, passed } = result;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-2xl border bg-card p-5 sm:col-span-2">
        <p className="text-sm text-muted-foreground">Score</p>
        <p className="mt-1 text-4xl font-semibold">{attempt.scorePercent}%</p>
        <Badge className="mt-3" variant={passed ? "default" : "destructive"}>
          {passed ? "Pass" : "Did not pass"}
        </Badge>
        <p className="mt-2 text-xs text-muted-foreground">Pass mark {attempt.passingScore}%</p>
      </div>
      <Stat label="Correct" value={attempt.correctCount ?? 0} />
      <Stat label="Incorrect" value={attempt.incorrectCount ?? 0} />
      <Stat label="Unanswered" value={attempt.unansweredCount ?? 0} />
      <Stat label="Time taken" value={formatDuration(attempt.timeTakenSec ?? 0)} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

export function ResultReview({ result }: { result: AttemptResult }) {
  return (
    <ol className="space-y-4">
      {result.review.map((question) => (
        <li key={question.id} className="rounded-2xl border bg-card p-5">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium">Question {question.order}</p>
            <Badge
              variant={
                question.result === "correct"
                  ? "default"
                  : question.result === "unanswered"
                    ? "outline"
                    : "destructive"
              }
            >
              {question.result}
            </Badge>
          </div>
          <p className="mt-2 font-medium">{question.prompt}</p>
          <ul className="mt-3 space-y-2 text-sm">
            {question.options.map((option) => {
              const selected = question.selectedOptionIds.includes(option.id);
              const correct = question.correctOptionIds.includes(option.id);
              return (
                <li
                  key={option.id}
                  className={cn(
                    "rounded-lg border px-3 py-2",
                    correct && "border-emerald-500/50 bg-emerald-50 dark:bg-emerald-950/30",
                    selected && !correct && "border-destructive/40 bg-destructive/5",
                  )}
                >
                  <span className="font-medium">{option.label}.</span> {option.body}
                  {correct ? <span className="ml-2 text-xs font-medium text-emerald-700">Correct</span> : null}
                  {selected && !correct ? (
                    <span className="ml-2 text-xs font-medium text-destructive">Your answer</span>
                  ) : null}
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Explanation. </span>
            {question.explanation}
          </p>
        </li>
      ))}
    </ol>
  );
}
