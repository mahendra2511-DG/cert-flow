import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/db";
import type { AttemptRecord } from "@/lib/exam/types";

const FILE = path.join("/tmp", "prepharbor-attempts.json");

type AttemptFile = { attempts: AttemptRecord[] };

const memory = globalThis as unknown as { __prepharborAttempts?: Map<string, AttemptRecord> };

function mem() {
  if (!memory.__prepharborAttempts) {
    memory.__prepharborAttempts = new Map();
  }
  return memory.__prepharborAttempts;
}

async function readFileStore(): Promise<AttemptRecord[]> {
  try {
    const raw = await readFile(FILE, "utf8");
    const parsed = JSON.parse(raw) as AttemptFile;
    return parsed.attempts ?? [];
  } catch {
    return [];
  }
}

async function writeFileStore(attempts: AttemptRecord[]) {
  await mkdir(path.dirname(FILE), { recursive: true });
  await writeFile(FILE, JSON.stringify({ attempts }, null, 2), "utf8");
}

export async function saveAttempt(attempt: AttemptRecord) {
  mem().set(attempt.id, attempt);
  const all = await readFileStore();
  const next = [attempt, ...all.filter((item) => item.id !== attempt.id)];
  await writeFileStore(next);

  if (prisma) {
    try {
      await prisma.attempt.upsert({
        where: { id: attempt.id },
        create: toPrismaCreate(attempt),
        update: toPrismaUpdate(attempt),
      });
    } catch {
      // Catalog can run without a migrated database.
    }
  }
}

export async function getAttempt(id: string) {
  const cached = mem().get(id);
  if (cached) {
    return cached;
  }
  const fromFile = (await readFileStore()).find((item) => item.id === id);
  if (fromFile) {
    mem().set(id, fromFile);
    return fromFile;
  }
  return null;
}

async function hydrate() {
  if (mem().size > 0) {
    return;
  }
  const fileItems = await readFileStore();
  for (const item of fileItems) {
    mem().set(item.id, item);
  }
}

export async function listAttemptsForExam(userId: string | null, vendorSlug: string, examSlug: string) {
  await hydrate();
  if (!userId) {
    return [];
  }
  return [...mem().values()].filter(
    (item) => item.vendorSlug === vendorSlug && item.examSlug === examSlug && item.userId === userId,
  );
}

export async function listAttemptsForUser(userId: string) {
  await hydrate();
  return [...mem().values()]
    .filter((item) => item.userId === userId)
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
}

function toPrismaCreate(attempt: AttemptRecord) {
  return {
    id: attempt.id,
    userId: attempt.userId,
    practiceTestId: attempt.practiceTestId,
    vendorSlug: attempt.vendorSlug,
    examSlug: attempt.examSlug,
    status: attempt.status,
    scorePercent: attempt.scorePercent,
    correctCount: attempt.correctCount,
    incorrectCount: attempt.incorrectCount,
    unansweredCount: attempt.unansweredCount,
    timeTakenSec: attempt.timeTakenSec,
    endsAt: new Date(attempt.endsAt),
    currentOrder: attempt.currentOrder,
    startedAt: new Date(attempt.startedAt),
    submittedAt: attempt.submittedAt ? new Date(attempt.submittedAt) : null,
    answers: {
      create: attempt.answers.map((answer) => ({
        questionId: answer.questionId,
        selectedOptionIds: answer.selectedOptionIds,
        flagged: answer.flagged,
      })),
    },
  };
}

function toPrismaUpdate(attempt: AttemptRecord) {
  return {
    status: attempt.status,
    scorePercent: attempt.scorePercent,
    correctCount: attempt.correctCount,
    incorrectCount: attempt.incorrectCount,
    unansweredCount: attempt.unansweredCount,
    timeTakenSec: attempt.timeTakenSec,
    currentOrder: attempt.currentOrder,
    submittedAt: attempt.submittedAt ? new Date(attempt.submittedAt) : null,
    answers: {
      deleteMany: {},
      create: attempt.answers.map((answer) => ({
        questionId: answer.questionId,
        selectedOptionIds: answer.selectedOptionIds,
        flagged: answer.flagged,
      })),
    },
  };
}
