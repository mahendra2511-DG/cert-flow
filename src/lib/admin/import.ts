import { randomBytes } from "node:crypto";
import type { LiveQuestion } from "@/lib/admin/catalog-store";
import { getLiveQuestions } from "@/lib/admin/catalog-store";

export type ImportRow = Record<string, string>;

export type ImportIssue = {
  row: number;
  field?: string;
  message: string;
};

export type ValidatedImport = {
  valid: Array<{ row: number; question: LiveQuestion; fingerprint: string }>;
  invalid: ImportIssue[];
  duplicates: ImportIssue[];
};

const LABELS = ["A", "B", "C", "D", "E"] as const;

function normalizeKey(key: string) {
  return key.trim().toLowerCase().replace(/\s+/g, "_");
}

export function parseCsv(text: string): ImportRow[] {
  const rows: string[][] = [];
  let current: string[] = [];
  let cell = "";
  let inQuotes = false;
  const input = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    const next = input[i + 1];
    if (inQuotes) {
      if (char === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        cell += char;
      }
      continue;
    }
    if (char === '"') {
      inQuotes = true;
      continue;
    }
    if (char === ",") {
      current.push(cell);
      cell = "";
      continue;
    }
    if (char === "\n" || (char === "\r" && next === "\n")) {
      current.push(cell);
      rows.push(current);
      current = [];
      cell = "";
      if (char === "\r") {
        i += 1;
      }
      continue;
    }
    if (char === "\r") {
      current.push(cell);
      rows.push(current);
      current = [];
      cell = "";
      continue;
    }
    cell += char;
  }
  current.push(cell);
  if (current.some((value) => value.length > 0)) {
    rows.push(current);
  }
  const header = (rows.shift() ?? []).map(normalizeKey);
  return rows
    .filter((row) => row.some((value) => value.trim()))
    .map((row) => {
      const record: ImportRow = {};
      header.forEach((key, index) => {
        record[key] = (row[index] ?? "").trim();
      });
      return record;
    });
}

export function parseImportPayload(text: string, filename: string): ImportRow[] {
  const trimmed = text.trim();
  if (!trimmed) {
    return [];
  }
  if (filename.toLowerCase().endsWith(".json") || trimmed.startsWith("[") || trimmed.startsWith("{")) {
    const parsed = JSON.parse(trimmed) as unknown;
    const rows = Array.isArray(parsed) ? parsed : parsed && typeof parsed === "object" && "questions" in parsed
      ? (parsed as { questions: unknown }).questions
      : null;
    if (!Array.isArray(rows)) {
      throw new Error("JSON must be an array of question objects.");
    }
    return rows.map((row) => {
      const record: ImportRow = {};
      if (row && typeof row === "object") {
        for (const [key, value] of Object.entries(row as Record<string, unknown>)) {
          record[normalizeKey(key)] = String(value ?? "").trim();
        }
      }
      return record;
    });
  }
  return parseCsv(trimmed);
}

function fingerprint(prompt: string) {
  return prompt.toLowerCase().replace(/\s+/g, " ").trim();
}

function parseCorrectAnswers(value: string, optionCount: number) {
  const tokens = value
    .split(/[,;/|]+/)
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean);
  const indexes = new Set<number>();
  for (const token of tokens) {
    const letter = token.replace(/^option_/, "").toUpperCase();
    const letterIndex = LABELS.indexOf(letter as (typeof LABELS)[number]);
    if (letterIndex >= 0 && letterIndex < optionCount) {
      indexes.add(letterIndex);
      continue;
    }
    const asNumber = Number(token);
    if (Number.isInteger(asNumber) && asNumber >= 1 && asNumber <= optionCount) {
      indexes.add(asNumber - 1);
    }
  }
  return indexes;
}

export function validateImportRows(rows: ImportRow[], testSlug: string): ValidatedImport {
  const existing = new Set(getLiveQuestions(testSlug).map((item) => fingerprint(item.prompt)));
  const seenInFile = new Set<string>();
  const valid: ValidatedImport["valid"] = [];
  const invalid: ImportIssue[] = [];
  const duplicates: ImportIssue[] = [];

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    const prompt = row.question?.trim() ?? "";
    const explanation = row.explanation?.trim() ?? "";
    const optionBodies = [row.option_a, row.option_b, row.option_c, row.option_d, row.option_e]
      .map((value) => (value ?? "").trim())
      .filter((value, optionIndex, array) => value || optionIndex < 2 || array.slice(0, optionIndex).every(Boolean));
    const filledOptions = [row.option_a, row.option_b, row.option_c, row.option_d, row.option_e].map(
      (value) => (value ?? "").trim(),
    );
    const options = filledOptions
      .map((body, optionIndex) => ({ body, label: LABELS[optionIndex] ?? String(optionIndex + 1) }))
      .filter((option) => option.body);

    if (!prompt) {
      invalid.push({ row: rowNumber, field: "question", message: "Question text is required." });
      return;
    }
    if (options.length < 2) {
      invalid.push({ row: rowNumber, field: "options", message: "At least two options are required." });
      return;
    }
    if (!explanation) {
      invalid.push({ row: rowNumber, field: "explanation", message: "Explanation is required." });
      return;
    }
    const correct = parseCorrectAnswers(row.correct_answer ?? "", options.length);
    if (correct.size === 0) {
      invalid.push({
        row: rowNumber,
        field: "correct_answer",
        message: "correct_answer must match option letters (A-E) or option_a-style keys.",
      });
      return;
    }

    const print = fingerprint(prompt);
    if (existing.has(print) || seenInFile.has(print)) {
      duplicates.push({
        row: rowNumber,
        field: "question",
        message: existing.has(print)
          ? "Duplicate of a question already on this test."
          : "Duplicate of another row in this file.",
      });
      return;
    }
    seenInFile.add(print);

    const live: LiveQuestion = {
      id: `${testSlug}-imp-${randomBytes(4).toString("hex")}`,
      order: 0,
      type: correct.size > 1 ? "MULTIPLE_CHOICE" : "SINGLE_CHOICE",
      prompt,
      explanation,
      options: options.map((option, optionIndex) => ({
        id: `${testSlug}-imp-${randomBytes(3).toString("hex")}`,
        label: option.label,
        body: option.body,
        isCorrect: correct.has(optionIndex),
      })),
      difficulty: (row.difficulty || "Intermediate").trim(),
      category: (row.category || "General").trim(),
      tags: (row.tags ?? "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      testSlug,
    };
    valid.push({ row: rowNumber, question: live, fingerprint: print });
    void optionBodies;
  });

  return { valid, invalid, duplicates };
}
