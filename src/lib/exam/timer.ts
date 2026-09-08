export function remainingSeconds(endsAtIso: string, now = Date.now()) {
  return Math.max(0, Math.floor((new Date(endsAtIso).getTime() - now) / 1000));
}

export function formatClock(totalSeconds: number) {
  const seconds = Math.max(0, totalSeconds);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
  }
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

export function timeTakenSeconds(startedAtIso: string, submittedAtIso: string) {
  return Math.max(
    0,
    Math.floor((new Date(submittedAtIso).getTime() - new Date(startedAtIso).getTime()) / 1000),
  );
}

export function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) {
    return `${seconds}s`;
  }
  return `${minutes}m ${seconds}s`;
}
