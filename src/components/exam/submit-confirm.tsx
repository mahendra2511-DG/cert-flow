"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";

export function SubmitConfirm({
  unanswered,
  onConfirm,
  pending,
}: {
  unanswered: number;
  onConfirm: () => void;
  pending?: boolean;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <Button type="button" variant="destructive" onClick={() => dialogRef.current?.showModal()}>
        Submit test
      </Button>
      <dialog
        ref={dialogRef}
        className="w-full max-w-md rounded-2xl border bg-background p-6 shadow-xl backdrop:bg-black/40"
      >
        <h2 className="text-lg font-semibold">Submit this sitting?</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {unanswered > 0
            ? `You still have ${unanswered} unanswered ${unanswered === 1 ? "question" : "questions"}. You cannot change answers after submit.`
            : "You answered every question. You cannot change answers after submit."}
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => dialogRef.current?.close()}>
            Keep practicing
          </Button>
          <Button type="button" disabled={pending} onClick={onConfirm}>
            {pending ? "Submitting…" : "Submit now"}
          </Button>
        </div>
      </dialog>
    </>
  );
}
