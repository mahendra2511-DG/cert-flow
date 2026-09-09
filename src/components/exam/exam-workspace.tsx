"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import type { Route } from "next";
import { ExamTimer } from "@/components/exam/exam-timer";
import { ProgressTracker } from "@/components/exam/progress-tracker";
import { QuestionNav } from "@/components/exam/question-nav";
import { QuestionRenderer } from "@/components/exam/question-renderer";
import { SubmitConfirm } from "@/components/exam/submit-confirm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { saveAnswerAction, submitAttemptAction, toggleFlagAction } from "@/lib/exam/actions";
import { answeredCount } from "@/lib/exam/result-calculator";
import type { ExamSnapshot } from "@/lib/exam/types";
import { Flag, LayoutGrid } from "lucide-react";

export function ExamWorkspace({
  vendor,
  exam,
  questionNumber,
  snapshot,
}: {
  vendor: string;
  exam: string;
  questionNumber: number;
  snapshot: ExamSnapshot;
}) {
  const [answers, setAnswers] = useState(snapshot.attempt.answers);
  const [pending, startTransition] = useTransition();
  const expireLock = useRef(false);

  const question = snapshot.questions.find((item) => item.order === questionNumber) ?? snapshot.questions[0];
  const answer = answers.find((item) => item.questionId === question?.id);
  const total = snapshot.questions.length;
  const unanswered = total - answeredCount(answers);

  const questionHref = (order: number) =>
    `/practice-test/${vendor}/${exam}/question/${order}?attempt=${snapshot.attempt.id}`;

  const persist = useCallback(
    (questionId: string, selectedOptionIds: string[]) => {
      startTransition(() => {
        void saveAnswerAction(snapshot.attempt.id, questionId, selectedOptionIds);
      });
    },
    [snapshot.attempt.id],
  );

  function onSelect(ids: string[]) {
    if (!question) return;
    setAnswers((current) =>
      current.map((item) =>
        item.questionId === question.id ? { ...item, selectedOptionIds: ids } : item,
      ),
    );
    persist(question.id, ids);
  }

  function onFlag() {
    if (!question) return;
    setAnswers((current) =>
      current.map((item) =>
        item.questionId === question.id ? { ...item, flagged: !item.flagged } : item,
      ),
    );
    startTransition(() => {
      void toggleFlagAction(snapshot.attempt.id, question.id);
    });
  }

  const finish = useCallback(() => {
    startTransition(() => {
      void submitAttemptAction(vendor, exam, snapshot.attempt.id);
    });
  }, [vendor, exam, snapshot.attempt.id]);

  const onExpire = useCallback(() => {
    if (expireLock.current) return;
    expireLock.current = true;
    finish();
  }, [finish]);

  useEffect(() => {
    function warn(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);

  if (!question) {
    return null;
  }

  const prev = question.order > 1 ? question.order - 1 : null;
  const next = question.order < total ? question.order + 1 : null;

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_16rem]">
      <div className="min-w-0">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3">
          <div>
            <p className="text-xs text-muted-foreground">
              {snapshot.attempt.examCode} · {snapshot.attempt.examName}
            </p>
            <div className="mt-1 flex items-center gap-2">
              <ProgressTracker answered={answeredCount(answers)} total={total} />
              <Badge variant="secondary">{snapshot.attempt.mode === "FREE" ? "Free 20" : "Premium"}</Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ExamTimer key={snapshot.attempt.id} remainingSeconds={snapshot.remainingSeconds} onExpire={onExpire} />
            <Sheet>
              <SheetTrigger
                render={
                  <Button variant="outline" size="icon" className="lg:hidden" aria-label="Question list" />
                }
              >
                <LayoutGrid className="size-4" />
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle>Questions</SheetTitle>
                </SheetHeader>
                <div className="px-4 pb-6">
                  <QuestionNav
                    questions={snapshot.questions}
                    answers={answers}
                    currentOrder={question.order}
                    hrefFor={questionHref}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <QuestionRenderer
          question={question}
          selectedIds={answer?.selectedOptionIds ?? []}
          onChange={onSelect}
          disabled={pending}
        />

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          {prev ? (
            <Button nativeButton={false} render={<Link href={questionHref(prev) as Route} />} variant="outline">
              Previous
            </Button>
          ) : (
            <Button type="button" variant="outline" disabled>
              Previous
            </Button>
          )}
          <Button type="button" variant={answer?.flagged ? "secondary" : "outline"} onClick={onFlag}>
            <Flag className="size-4" />
            {answer?.flagged ? "Flagged" : "Flag question"}
          </Button>
          {next ? (
            <Button nativeButton={false} render={<Link href={questionHref(next) as Route} />}>
              Next
            </Button>
          ) : (
            <SubmitConfirm unanswered={unanswered} onConfirm={finish} pending={pending} />
          )}
        </div>
      </div>

      <aside className="hidden space-y-4 lg:sticky lg:top-24 lg:block lg:self-start">
        <div className="rounded-2xl border bg-card p-4">
          <p className="mb-3 text-sm font-medium">Questions</p>
          <QuestionNav
            questions={snapshot.questions}
            answers={answers}
            currentOrder={question.order}
            hrefFor={questionHref}
          />
        </div>
        <SubmitConfirm unanswered={unanswered} onConfirm={finish} pending={pending} />
      </aside>
    </div>
  );
}
