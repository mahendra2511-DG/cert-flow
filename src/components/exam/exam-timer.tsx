"use client";

import { useEffect, useRef, useState } from "react";
import { formatClock } from "@/lib/exam/timer";
import { cn } from "@/lib/utils";

export function ExamTimer({
  remainingSeconds,
  onExpire,
}: {
  remainingSeconds: number;
  onExpire: () => void;
}) {
  const [seconds, setSeconds] = useState(remainingSeconds);
  const called = useRef(false);

  useEffect(() => {
    const id = window.setInterval(() => {
      setSeconds((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (seconds === 0 && !called.current) {
      called.current = true;
      onExpire();
    }
  }, [seconds, onExpire]);

  const urgent = seconds <= 60;

  return (
    <p
      className={cn(
        "font-mono text-sm font-semibold tabular-nums",
        urgent ? "text-destructive" : "text-foreground",
      )}
      aria-live="polite"
      aria-label={`Time remaining ${formatClock(seconds)}`}
    >
      {formatClock(seconds)}
    </p>
  );
}
