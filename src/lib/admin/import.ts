import { randomBytes } from "node:crypto";
import type { LiveQuestion } from "@/lib/admin/catalog-store";
import { getLiveQuestions, normalizeDifficulty } from "@/lib/admin/catalog-store";

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

export const CSV_TEMPLATE = `question,option_a,option_b,option_c,option_d,option_e,correct_answer,explanation,difficulty,category,question_type,is_free
Which service stores objects with eleven nines of durability?,Amazon S3,Amazon EBS,Amazon EFS,Amazon RDS,,A,S3 is the object store designed for eleven nines of durability.,Medium,Storage,single,true
A workload needs two correct controls. Select both.,Enable MFA,Share root keys,Use least-privilege IAM,Disable CloudTrail,,A;C,MFA and least privilege reduce account takeover risk.,Hard,IAM,multiple,false
`;

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

function truthy(value?: string) {
  const raw = (value ?? "").trim().toLowerCase();
  return raw === "true" || raw === "1" || raw === "yes" || raw === "free";
}

function jsonRowToImport(row: Record<string, unknown>): ImportRow {
  const record: ImportRow = {};
  for (const [key, value] of Object.entries(row)) {
    const normalized = normalizeKey(key);
    if (normalized === "options" && Array.isArray(value)) {
      value.forEach((body, index) => {
        const label = LABELS[index];
        if (label) {
          record[`option_${label.toLowerCase()}`] = String(body ?? "").trim();
        }
      });
      continue;
    }
    if (Array.isArray(value)) {
      record[normalized] = value.map((item) => String(item ?? "").trim()).join(",");
      continue;
    }
    record[normalized] = String(value ?? "").trim();
  }
  if (record.correctanswer && !record.correct_answer) {
    record.correct_answer = record.correctanswer;
  }
  if (record.isfree && !record.is_free) {
    record.is_free = record.isfree;
  }
  if (record.questiontype && !record.question_type) {
    record.question_type = record.questiontype;
  }
  return record;
}

export function parseImportPayload(text: string, filename: string): ImportRow[] {
  const trimmed = text.trim();
  if (!trimmed) {
    return [];
  }
  if (filename.toLowerCase().endsWith(".json") || trimmed.startsWith("[") || trimmed.startsWith("{")) {
    const parsed = JSON.parse(trimmed) as unknown;
    const rows = Array.isArray(parsed)
      ? parsed
      : parsed && typeof parsed === "object" && "questions" in parsed
        ? (parsed as { questions: unknown }).questions
        : null;
    if (!Array.isArray(rows)) {
      throw new Error("JSON must be an array of question objects.");
    }
    return rows.map((row) =>
      row && typeof row === "object" ? jsonRowToImport(row as Record<string, unknown>) : {},
    );
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

    const typeToken = (row.question_type ?? "").trim().toLowerCase();
    const type =
      typeToken === "multiple" || typeToken === "multiple_choice" || correct.size > 1
        ? "MULTIPLE_CHOICE"
        : "SINGLE_CHOICE";

    const live: LiveQuestion = {
      id: `${testSlug}-imp-${randomBytes(4).toString("hex")}`,
      order: 0,
      type,
      prompt,
      explanation,
      options: options.map((option, optionIndex) => ({
        id: `${testSlug}-imp-${randomBytes(3).toString("hex")}`,
        label: option.label,
        body: option.body,
        isCorrect: correct.has(optionIndex),
      })),
      difficulty: normalizeDifficulty(row.difficulty || "Medium"),
      category: (row.category || "General").trim(),
      tags: (row.tags ?? "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      testSlug,
      isFree: truthy(row.is_free),
      status: (row.status || "published").toLowerCase() === "draft" ? "draft" : "published",
      updatedAt: new Date().toISOString(),
      version: "1.0",
    };
    valid.push({ row: rowNumber, question: live, fingerprint: print });
  });

  return { valid, invalid, duplicates };
}
