"use client";

import { useSyncExternalStore } from "react";

export type ToastVariant = "success" | "error" | "info";

export type Toast = {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
};

type Listener = () => void;

let toasts: Toast[] = [];
const listeners = new Set<Listener>();

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

export function toast(title: string, options?: { description?: string; variant?: ToastVariant }) {
  const item: Toast = {
    id: `toast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    title,
    description: options?.description,
    variant: options?.variant ?? "info",
  };
  toasts = [...toasts, item].slice(-5);
  emit();
  window.setTimeout(() => dismissToast(item.id), 5000);
  return item.id;
}

export function dismissToast(id: string) {
  toasts = toasts.filter((item) => item.id !== id);
  emit();
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return toasts;
}

const EMPTY: Toast[] = [];

function getServerSnapshot() {
  return EMPTY;
}

export function Toaster() {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (items.length === 0) {
    return null;
  }
  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-50 flex w-[min(100%-2rem,24rem)] flex-col gap-2">
      {items.map((item) => (
        <div
          key={item.id}
          role="status"
          className={
            item.variant === "error"
              ? "pointer-events-auto rounded-xl border border-destructive/40 bg-background px-4 py-3 text-sm shadow-lg"
              : item.variant === "success"
                ? "pointer-events-auto rounded-xl border border-emerald-200 bg-background px-4 py-3 text-sm shadow-lg"
                : "pointer-events-auto rounded-xl border bg-background px-4 py-3 text-sm shadow-lg"
          }
        >
          <p className="font-medium">{item.title}</p>
          {item.description ? <p className="mt-1 text-muted-foreground">{item.description}</p> : null}
          <button
            type="button"
            className="mt-2 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => dismissToast(item.id)}
          >
            Dismiss
          </button>
        </div>
      ))}
    </div>
  );
}
