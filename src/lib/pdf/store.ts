import { mkdirSync, readFileSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { buildStudyPdf } from "@/lib/pdf/document";
import { findExamContext } from "@/lib/exam/engine";

const META_FILE = path.join("/tmp", "prepharbor-pdfs.json");
const DIR = path.join("/tmp", "prepharbor-pdfs");

export type PremiumPdfRecord = {
  id: string;
  vendorSlug: string;
  examSlug: string;
  title: string;
  description: string;
  version: string;
  status: "published" | "draft";
  questionCount: number;
  updatedAt: string;
  createdAt: string;
  filename: string;
  storageName: string;
  fileSize: number;
  downloadCount: number;
  pdfType: "PREMIUM_PDF";
};

type StoreFile = { items: PremiumPdfRecord[] };

const memory = globalThis as unknown as { __prepharborPdfs?: PremiumPdfRecord[] };

function load(): PremiumPdfRecord[] {
  if (memory.__prepharborPdfs) {
    return memory.__prepharborPdfs;
  }
  try {
    const parsed = JSON.parse(readFileSync(META_FILE, "utf8")) as StoreFile;
    memory.__prepharborPdfs = parsed.items ?? [];
  } catch {
    memory.__prepharborPdfs = [];
  }
  return memory.__prepharborPdfs;
}

function persist() {
  mkdirSync(DIR, { recursive: true });
  writeFileSync(META_FILE, JSON.stringify({ items: load() }, null, 2), "utf8");
}

export function examPdfKey(vendorSlug: string, examSlug: string) {
  return `${vendorSlug}/${examSlug}`;
}

export function listPremiumPdfs() {
  return load().slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getPremiumPdf(vendorSlug: string, examSlug: string) {
  return (
    load().find(
      (item) => item.vendorSlug === vendorSlug && item.examSlug === examSlug && item.status === "published",
    ) ?? null
  );
}

export function getPremiumPdfAny(vendorSlug: string, examSlug: string) {
  return load().find((item) => item.vendorSlug === vendorSlug && item.examSlug === examSlug) ?? null;
}

export function ensureSeedPdf(vendorSlug: string, examSlug: string) {
  const existing = getPremiumPdfAny(vendorSlug, examSlug);
  if (existing) {
    return existing;
  }
  const context = findExamContext(vendorSlug, examSlug);
  if (!context) {
    return null;
  }
  const bytes = buildStudyPdf({
    title: `${context.exam.code} Premium Study Notes`,
    examCode: context.exam.code,
    examName: context.exam.name,
    version: "2026.1",
    questionCount: context.test.questionCount,
  });
  return savePremiumPdf({
    vendorSlug,
    examSlug,
    title: `${context.exam.code} Premium Study Notes`,
    description: "Original Certiva study notes packaged as a premium PDF. Not a vendor exam dump.",
    version: "2026.1",
    status: "published",
    questionCount: context.test.questionCount,
    filename: `${context.exam.code.toLowerCase()}-premium-notes.pdf`,
    bytes,
  });
}

export function savePremiumPdf(input: {
  vendorSlug: string;
  examSlug: string;
  title: string;
  description: string;
  version: string;
  status: "published" | "draft";
  questionCount: number;
  filename: string;
  bytes: Buffer;
}) {
  mkdirSync(DIR, { recursive: true });
  const items = load();
  const previous = items.find((item) => item.vendorSlug === input.vendorSlug && item.examSlug === input.examSlug);
  const id = previous?.id ?? `pdf_${randomBytes(6).toString("hex")}`;
  const storageName = `${id}.pdf`;
  writeFileSync(path.join(DIR, storageName), input.bytes);
  const record: PremiumPdfRecord = {
    id,
    vendorSlug: input.vendorSlug,
    examSlug: input.examSlug,
    title: input.title,
    description: input.description,
    version: input.version || bumpPdfVersion(previous?.version),
    status: input.status,
    questionCount: input.questionCount,
    updatedAt: new Date().toISOString(),
    createdAt: previous?.createdAt ?? new Date().toISOString(),
    filename: input.filename,
    storageName,
    fileSize: input.bytes.length,
    downloadCount: previous?.downloadCount ?? 0,
    pdfType: "PREMIUM_PDF",
  };
  memory.__prepharborPdfs = [record, ...items.filter((item) => item.id !== id)];
  persist();
  return record;
}

export function deletePremiumPdf(vendorSlug: string, examSlug: string) {
  const current = getPremiumPdfAny(vendorSlug, examSlug);
  if (!current) {
    return;
  }
  try {
    unlinkSync(path.join(DIR, current.storageName));
  } catch {
    // ignore missing blob
  }
  memory.__prepharborPdfs = load().filter((item) => item.id !== current.id);
  persist();
}

export function readPremiumPdfBytes(record: PremiumPdfRecord) {
  return readFileSync(path.join(DIR, record.storageName));
}

export function incrementPdfDownload(record: PremiumPdfRecord) {
  const items = load();
  const current = items.find((item) => item.id === record.id);
  if (!current) {
    return record;
  }
  current.downloadCount = (current.downloadCount ?? 0) + 1;
  persist();
  return current;
}

export function togglePremiumPdfStatus(vendorSlug: string, examSlug: string) {
  const current = getPremiumPdfAny(vendorSlug, examSlug);
  if (!current) {
    return null;
  }
  current.status = current.status === "published" ? "draft" : "published";
  current.updatedAt = new Date().toISOString();
  persist();
  return current;
}

export function pdfFileBytesOnDisk(record: PremiumPdfRecord) {
  try {
    return statSync(path.join(DIR, record.storageName)).size;
  } catch {
    return record.fileSize ?? 0;
  }
}

function bumpPdfVersion(previous?: string) {
  if (!previous) {
    return "v1.0";
  }
  const cleaned = previous.replace(/^v/i, "");
  const [major] = cleaned.split(".");
  const next = (Number(major) || 1) + 1;
  return `v${next}.0`;
}
