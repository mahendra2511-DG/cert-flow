"use client";

import { useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function ConfirmForm({
  action,
  title,
  description,
  confirmLabel = "Confirm",
  children,
}: {
  action: (formData: FormData) => void | Promise<void>;
  title: string;
  description: string;
  confirmLabel?: string;
  children: ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [armed, setArmed] = useState(false);

  return (
    <>
      <form
        ref={formRef}
        action={action}
        onSubmit={(event) => {
          if (armed) return;
          event.preventDefault();
          dialogRef.current?.showModal();
        }}
      >
        {children}
      </form>
      <dialog
        ref={dialogRef}
        className="fixed top-1/2 left-1/2 z-50 w-[min(100%-2rem,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-background p-5 text-foreground shadow-lg backdrop:bg-foreground/40"
      >
        <p className="text-lg font-semibold">{title}</p>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => dialogRef.current?.close()}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              setArmed(true);
              dialogRef.current?.close();
              queueMicrotask(() => formRef.current?.requestSubmit());
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      </dialog>
    </>
  );
}
