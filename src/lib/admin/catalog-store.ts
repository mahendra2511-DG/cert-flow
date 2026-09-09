import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import {
  seedExams,
  seedVendors,
  type SeedExam,
  type SeedPracticeTest,
  type SeedVendor,
} from "@/lib/catalog/seed-catalog";
import type { ExamQuestion } from "@/lib/exam/types";
import { getBaseQuestionsForTest } from "@/lib/exam/questions";

const CATALOG_FILE = path.join("/tmp", "prepharbor-admin-catalog.json");
const QUESTIONS_FILE = path.join("/tmp", "prepharbor-admin-questions.json");

export type PaperType = "FREE" | "PREMIUM";
export type SelectionMethod = "RANDOM" | "FIXED" | "CATEGORY";
export type QuestionStatus = "published" | "draft";

export type LiveVendor = SeedVendor & { isPublished: boolean };
export type LiveTest = SeedPracticeTest & {
  isPublished: boolean;
  paperType: PaperType;
  selectionMethod: SelectionMethod;
  questionIds: string[];
  categoryFilter?: string;
};
export type LiveExam = Omit<SeedExam, "tests"> & {
  isPublished: boolean;
  tests: LiveTest[];
  updatedAt: string;
  contentVersion: string;
};
export type LiveQuestion = ExamQuestion & {
  difficulty: string;
  category: string;
  tags: string[];
  testSlug: string;
  isFree: boolean;
  status: QuestionStatus;
  imageUrl?: string;
  updatedAt: string;
  version: string;
};

type CatalogFile = { vendors: LiveVendor[]; exams: LiveExam[] };
type QuestionFile = { banks: Record<string, LiveQuestion[]> };

const memory = globalThis as unknown as {
  __prepharborLiveVendors?: LiveVendor[];
  __prepharborLiveExams?: LiveExam[];
  __prepharborQuestionBanks?: Map<string, LiveQuestion[]>;
  __prepharborCatalogReady?: boolean;
};

function nowIso() {
  return new Date().toISOString();
}

function cloneSeed(): CatalogFile {
  const stamped = nowIso();
  return {
    vendors: seedVendors.map((vendor) => ({ ...vendor, isPublished: true })),
    exams: seedExams.map((exam) => ({
      ...exam,
      isPublished: true,
      freeQuestionLimit: exam.freeQuestionLimit ?? 20,
      premiumQuestionCount: exam.premiumQuestionCount,
      featured: exam.featured ?? exam.isPopular,
      updatedAt: stamped,
      contentVersion: "1.0",
      categorySlugs: [...exam.categorySlugs],
      outcomes: [...exam.outcomes],
      faqs: exam.faqs.map((faq) => ({ ...faq })),
      tests: exam.tests.map((test) => ({
        ...test,
        isPublished: true,
        paperType: test.pricePaise === 0 ? "FREE" : "PREMIUM",
        selectionMethod: "RANDOM" as const,
        questionIds: [] as string[],
      })),
    })),
  };
}

function persistCatalog() {
  mkdirSync(path.dirname(CATALOG_FILE), { recursive: true });
  writeFileSync(
    CATALOG_FILE,
    JSON.stringify(
      { vendors: memory.__prepharborLiveVendors, exams: memory.__prepharborLiveExams },
      null,
      2,
    ),
    "utf8",
  );
}

function persistQuestions() {
  mkdirSync(path.dirname(QUESTIONS_FILE), { recursive: true });
  const banks = Object.fromEntries(memory.__prepharborQuestionBanks ?? []);
  writeFileSync(QUESTIONS_FILE, JSON.stringify({ banks }, null, 2), "utf8");
}

export function ensureCatalog() {
  if (memory.__prepharborCatalogReady) {
    return;
  }
  try {
    const parsed = JSON.parse(readFileSync(CATALOG_FILE, "utf8")) as CatalogFile;
    memory.__prepharborLiveVendors = parsed.vendors ?? cloneSeed().vendors;
    memory.__prepharborLiveExams = parsed.exams ?? cloneSeed().exams;
  } catch {
    const seeded = cloneSeed();
    memory.__prepharborLiveVendors = seeded.vendors;
    memory.__prepharborLiveExams = seeded.exams;
  }
  memory.__prepharborQuestionBanks = new Map();
  try {
    const parsed = JSON.parse(readFileSync(QUESTIONS_FILE, "utf8")) as QuestionFile;
    for (const [slug, questions] of Object.entries(parsed.banks ?? {})) {
      memory.__prepharborQuestionBanks.set(slug, questions);
    }
  } catch {
    // start empty; banks fill on first admin edit or list
  }
  mergeNewSeedItems();
  memory.__prepharborCatalogReady = true;
}

function mergeNewSeedItems() {
  const seeded = cloneSeed();
  const liveVendors = memory.__prepharborLiveVendors!;
  const liveExams = memory.__prepharborLiveExams!;
  const vendorSlugs = new Set(liveVendors.map((item) => item.slug));
  for (const vendor of seeded.vendors) {
    if (!vendorSlugs.has(vendor.slug)) {
      liveVendors.push(vendor);
      vendorSlugs.add(vendor.slug);
    }
  }
  const examKeys = new Set(liveExams.map((item) => `${item.vendorSlug}/${item.slug}`));
  for (const exam of seeded.exams) {
    if (!examKeys.has(`${exam.vendorSlug}/${exam.slug}`)) {
      liveExams.push(exam);
    }
  }
  for (const exam of liveExams) {
    exam.freeQuestionLimit = exam.freeQuestionLimit ?? 20;
    exam.featured = exam.featured ?? exam.isPopular;
    exam.updatedAt = exam.updatedAt ?? nowIso();
    exam.contentVersion = exam.contentVersion ?? "1.0";
    exam.tests = exam.tests.map((test) => ({
      ...test,
      paperType: test.paperType ?? (test.pricePaise === 0 ? "FREE" : "PREMIUM"),
      selectionMethod: test.selectionMethod ?? "RANDOM",
      questionIds: test.questionIds ?? [],
    }));
  }
  persistCatalog();
}

function vendors() {
  ensureCatalog();
  return memory.__prepharborLiveVendors!;
}

function exams() {
  ensureCatalog();
  return memory.__prepharborLiveExams!;
}

function banks() {
  ensureCatalog();
  return memory.__prepharborQuestionBanks!;
}

export function slugify(value: string) {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || `item-${randomBytes(3).toString("hex")}`;
}

export function listVendorsAdmin() {
  return vendors().slice().sort((a, b) => a.name.localeCompare(b.name));
}

export function listExamsAdmin() {
  return exams().slice().sort((a, b) => a.code.localeCompare(b.code));
}

export function getVendorAdmin(slug: string) {
  return vendors().find((item) => item.slug === slug) ?? null;
}

export function getExamAdmin(vendorSlug: string, examSlug: string) {
  return exams().find((item) => item.vendorSlug === vendorSlug && item.slug === examSlug) ?? null;
}

export function getExamByKey(key: string) {
  const [vendorSlug, examSlug] = key.split("/");
  if (!vendorSlug || !examSlug) {
    return null;
  }
  return getExamAdmin(vendorSlug, examSlug);
}

export function listTestsAdmin() {
  return exams().flatMap((exam) =>
    exam.tests.map((test) => ({
      ...test,
      vendorSlug: exam.vendorSlug,
      examSlug: exam.slug,
      examCode: exam.code,
      examName: exam.name,
    })),
  );
}

export function getTestAdmin(testSlug: string) {
  for (const exam of exams()) {
    const test = exam.tests.find((item) => item.slug === testSlug);
    if (test) {
      return { exam, test };
    }
  }
  return null;
}

export function getPublicVendors() {
  return vendors().filter((item) => item.isPublished);
}

export function getPublicExams() {
  const publishedVendors = new Set(getPublicVendors().map((item) => item.slug));
  return exams().filter(
    (exam) =>
      exam.isPublished &&
      publishedVendors.has(exam.vendorSlug) &&
      exam.tests.some((test) => test.isPublished),
  );
}

export function listPublicPracticeTests() {
  return getPublicExams().flatMap((exam) =>
    exam.tests
      .filter((test) => test.isPublished)
      .map((test) => ({
        ...test,
        vendorSlug: exam.vendorSlug,
        examSlug: exam.slug,
        examCode: exam.code,
      })),
  );
}

export function findLivePracticeTest(slug: string) {
  for (const exam of exams()) {
    const test = exam.tests.find((item) => item.slug === slug);
    if (test) {
      return { exam, test, vendorSlug: exam.vendorSlug };
    }
  }
  return null;
}

export function vendorIsPublic(slug: string) {
  return Boolean(getVendorAdmin(slug)?.isPublished);
}

function bumpExamUpdated(exam: LiveExam) {
  exam.updatedAt = nowIso();
  const parts = String(exam.contentVersion || "1.0").replace(/^v/i, "").split(".");
  const major = Number(parts[0] || 1);
  const minor = Number(parts[1] || 0);
  exam.contentVersion = `${Number.isFinite(major) ? major : 1}.${(Number.isFinite(minor) ? minor : 0) + 1}`;
}

function touchExamForTest(testSlug: string) {
  const found = getTestAdmin(testSlug);
  if (found) {
    bumpExamUpdated(found.exam);
  }
}

function normalizeDifficulty(value?: string) {
  const raw = (value ?? "").trim().toLowerCase();
  if (raw === "easy" || raw === "beginner") {
    return "Easy";
  }
  if (raw === "hard" || raw === "expert" || raw === "advanced") {
    return "Hard";
  }
  return "Medium";
}

function normalizeQuestion(question: ExamQuestion, testSlug: string, index: number): LiveQuestion {
  const limit = 20;
  return {
    ...question,
    order: question.order || index + 1,
    difficulty: normalizeDifficulty(question.difficulty ?? "Medium"),
    category: question.category ?? "General",
    tags: question.tags ?? [],
    testSlug,
    isFree: question.isFree ?? index < limit,
    status: question.status ?? "published",
    imageUrl: question.imageUrl,
    updatedAt: question.updatedAt ?? nowIso(),
    version: question.version ?? "1.0",
  };
}

export function getLiveQuestions(testSlug: string): LiveQuestion[] {
  const cached = banks().get(testSlug);
  if (cached) {
    return cached.map((question, index) => normalizeQuestion(question, testSlug, index));
  }
  return getBaseQuestionsForTest(testSlug).map((question, index) =>
    normalizeQuestion(question, testSlug, index),
  );
}

export function countAllQuestions() {
  const seen = new Set<string>();
  let total = 0;
  for (const exam of exams()) {
    for (const test of exam.tests) {
      if (seen.has(test.slug)) {
        continue;
      }
      seen.add(test.slug);
      total += getLiveQuestions(test.slug).length;
    }
  }
  return total;
}

export function saveVendor(input: {
  slug?: string;
  name: string;
  description: string;
  longDescription: string;
  isPublished: boolean;
}) {
  const list = vendors();
  const slug = input.slug?.trim() || slugify(input.name);
  const existing = list.find((item) => item.slug === slug);
  if (existing) {
    existing.name = input.name.trim();
    existing.description = input.description.trim();
    existing.longDescription = input.longDescription.trim();
    existing.isPublished = input.isPublished;
  } else {
    if (list.some((item) => item.slug === slug)) {
      throw new Error("SLUG_TAKEN");
    }
    list.push({
      slug,
      name: input.name.trim(),
      description: input.description.trim(),
      longDescription: input.longDescription.trim() || input.description.trim(),
      isPublished: input.isPublished,
    });
  }
  persistCatalog();
  return slug;
}

export function deleteVendor(slug: string) {
  memory.__prepharborLiveVendors = vendors().filter((item) => item.slug !== slug);
  const removedExams = exams().filter((item) => item.vendorSlug === slug);
  memory.__prepharborLiveExams = exams().filter((item) => item.vendorSlug !== slug);
  for (const exam of removedExams) {
    for (const test of exam.tests) {
      banks().delete(test.slug);
    }
  }
  persistCatalog();
  persistQuestions();
}

export function toggleVendorPublished(slug: string) {
  const vendor = getVendorAdmin(slug);
  if (!vendor) {
    throw new Error("NOT_FOUND");
  }
  vendor.isPublished = !vendor.isPublished;
  persistCatalog();
  return vendor.isPublished;
}

export function saveExam(input: {
  originalSlug?: string;
  vendorSlug: string;
  slug?: string;
  name: string;
  code: string;
  description: string;
  summary?: string;
  pricePaise: number;
  durationMin: number;
  questionCount: number;
  seoTitle: string;
  seoDescription: string;
  isPublished: boolean;
  level?: string;
  freeQuestionLimit?: number;
  premiumQuestionCount?: number;
}) {
  if (!getVendorAdmin(input.vendorSlug)) {
    throw new Error("VENDOR_NOT_FOUND");
  }
  const slug = input.slug?.trim() || slugify(input.code || input.name);
  const list = exams();
  const current =
    (input.originalSlug
      ? list.find((item) => item.vendorSlug === input.vendorSlug && item.slug === input.originalSlug)
      : list.find((item) => item.vendorSlug === input.vendorSlug && item.slug === slug)) ?? null;

  if (
    list.some(
      (item) =>
        item.vendorSlug === input.vendorSlug &&
        item.slug === slug &&
        item !== current,
    )
  ) {
    throw new Error("SLUG_TAKEN");
  }

  const description = input.description.trim();
  if (current) {
    current.slug = slug;
    current.name = input.name.trim();
    current.code = input.code.trim().toUpperCase();
    current.description = description;
    current.summary = input.summary?.trim() || description.slice(0, 140);
    current.durationMin = input.durationMin;
    current.seoTitle = input.seoTitle.trim() || `${current.code} practice test`;
    current.seoDescription = input.seoDescription.trim() || current.summary;
    current.isPublished = input.isPublished;
    current.level = input.level?.trim() || current.level;
    current.freeQuestionLimit = input.freeQuestionLimit ?? current.freeQuestionLimit ?? 20;
    current.premiumQuestionCount = input.premiumQuestionCount ?? current.premiumQuestionCount;
    const test = current.tests[0];
    if (test) {
      test.pricePaise = input.pricePaise;
      test.timeLimitMin = input.durationMin;
      test.questionCount = input.questionCount;
    } else {
      current.tests.push({
        slug: `${slug}-practice`,
        title: `${current.code} Practice Exam`,
        summary: current.summary,
        description,
        questionCount: input.questionCount,
        timeLimitMin: input.durationMin,
        passingScore: current.passingScore,
        pricePaise: input.pricePaise,
        ratingAverage: 0,
        ratingCount: 0,
        isPopular: false,
        isPublished: input.isPublished,
        paperType: input.pricePaise === 0 ? "FREE" : "PREMIUM",
        selectionMethod: "RANDOM",
        questionIds: [],
      });
    }
    current.updatedAt = nowIso();
    persistCatalog();
    return current;
  }

  const exam: LiveExam = {
    slug,
    vendorSlug: input.vendorSlug,
    categorySlugs: [input.vendorSlug],
    code: input.code.trim().toUpperCase(),
    name: input.name.trim(),
    summary: input.summary?.trim() || description.slice(0, 140),
    description,
    level: input.level?.trim() || "Associate",
    durationMin: input.durationMin,
    passingScore: 70,
    language: "English",
    examFormat: "Multiple choice",
    isPopular: false,
    seoTitle: input.seoTitle.trim() || `${input.code.trim().toUpperCase()} practice test`,
    seoDescription: input.seoDescription.trim() || description.slice(0, 160),
    outcomes: ["Cover the published skill areas with original scenarios"],
    faqs: [],
    isPublished: input.isPublished,
    updatedAt: nowIso(),
    contentVersion: "1.0",
    freeQuestionLimit: input.freeQuestionLimit ?? 20,
    premiumQuestionCount: input.premiumQuestionCount,
    tests: [
      {
        slug: `${slug}-practice`,
        title: `${input.code.trim().toUpperCase()} Practice Exam`,
        summary: description.slice(0, 140),
        description,
        questionCount: input.questionCount,
        timeLimitMin: input.durationMin,
        passingScore: 70,
        pricePaise: input.pricePaise,
        ratingAverage: 0,
        ratingCount: 0,
        isPopular: false,
        isPublished: input.isPublished,
        paperType: input.pricePaise === 0 ? "FREE" : "PREMIUM",
        selectionMethod: "RANDOM",
        questionIds: [],
      },
    ],
  };
  list.push(exam);
  persistCatalog();
  return exam;
}

export function deleteExam(vendorSlug: string, examSlug: string) {
  const exam = getExamAdmin(vendorSlug, examSlug);
  memory.__prepharborLiveExams = exams().filter(
    (item) => !(item.vendorSlug === vendorSlug && item.slug === examSlug),
  );
  if (exam) {
    for (const test of exam.tests) {
      banks().delete(test.slug);
    }
    persistQuestions();
  }
  persistCatalog();
}

export function toggleExamPublished(vendorSlug: string, examSlug: string) {
  const exam = getExamAdmin(vendorSlug, examSlug);
  if (!exam) {
    throw new Error("NOT_FOUND");
  }
  exam.isPublished = !exam.isPublished;
  exam.updatedAt = nowIso();
  persistCatalog();
  return exam.isPublished;
}

export function saveTest(input: {
  originalSlug?: string;
  vendorSlug: string;
  examSlug: string;
  slug?: string;
  title: string;
  summary: string;
  description: string;
  pricePaise: number;
  timeLimitMin: number;
  passingScore: number;
  questionCount: number;
  isPublished: boolean;
  paperType?: PaperType;
  selectionMethod?: SelectionMethod;
  questionIds?: string[];
  categoryFilter?: string;
}) {
  const exam = getExamAdmin(input.vendorSlug, input.examSlug);
  if (!exam) {
    throw new Error("EXAM_NOT_FOUND");
  }
  const slug = input.slug?.trim() || slugify(input.title);
  if (
    exams().some((item) =>
      item.tests.some((test) => test.slug === slug && test.slug !== input.originalSlug),
    )
  ) {
    throw new Error("SLUG_TAKEN");
  }
  const current = exam.tests.find((test) => test.slug === (input.originalSlug ?? slug));
  if (current) {
    const previousSlug = current.slug;
    current.slug = slug;
    current.title = input.title.trim();
    current.summary = input.summary.trim();
    current.description = input.description.trim();
    current.pricePaise = input.pricePaise;
    current.timeLimitMin = input.timeLimitMin;
    current.passingScore = input.passingScore;
    current.questionCount = input.questionCount;
    current.isPublished = input.isPublished;
    current.paperType = input.paperType ?? current.paperType ?? (input.pricePaise === 0 ? "FREE" : "PREMIUM");
    current.selectionMethod = input.selectionMethod ?? current.selectionMethod ?? "RANDOM";
    current.questionIds = input.questionIds ?? current.questionIds ?? [];
    current.categoryFilter = input.categoryFilter ?? current.categoryFilter;
    if (previousSlug !== slug) {
      const bank = banks().get(previousSlug);
      if (bank) {
        banks().delete(previousSlug);
        banks().set(
          slug,
          bank.map((question) => ({ ...question, testSlug: slug })),
        );
        persistQuestions();
      }
    }
  } else {
    exam.tests.push({
      slug,
      title: input.title.trim(),
      summary: input.summary.trim(),
      description: input.description.trim(),
      questionCount: input.questionCount,
      timeLimitMin: input.timeLimitMin,
      passingScore: input.passingScore,
      pricePaise: input.pricePaise,
      ratingAverage: 0,
      ratingCount: 0,
      isPopular: false,
      isPublished: input.isPublished,
      paperType: input.paperType ?? (input.pricePaise === 0 ? "FREE" : "PREMIUM"),
      selectionMethod: input.selectionMethod ?? "RANDOM",
      questionIds: input.questionIds ?? [],
      categoryFilter: input.categoryFilter,
    });
  }
  bumpExamUpdated(exam);
  persistCatalog();
  return slug;
}

export function deleteTest(testSlug: string) {
  for (const exam of exams()) {
    exam.tests = exam.tests.filter((test) => test.slug !== testSlug);
  }
  banks().delete(testSlug);
  persistCatalog();
  persistQuestions();
}

export function toggleTestPublished(testSlug: string) {
  const found = getTestAdmin(testSlug);
  if (!found) {
    throw new Error("NOT_FOUND");
  }
  found.test.isPublished = !found.test.isPublished;
  bumpExamUpdated(found.exam);
  persistCatalog();
  return found.test.isPublished;
}

export function listQuestionsAdmin(testSlug?: string) {
  const tests = testSlug ? [testSlug] : listTestsAdmin().map((item) => item.slug);
  return tests.flatMap((slug) => getLiveQuestions(slug));
}

export function getQuestionAdmin(id: string) {
  return listQuestionsAdmin().find((item) => item.id === id) ?? null;
}

function persistBank(testSlug: string, questions: LiveQuestion[]) {
  const next = questions.map((question, index) => ({
    ...question,
    order: index + 1,
    testSlug,
  }));
  banks().set(testSlug, next);
  const found = getTestAdmin(testSlug);
  if (found) {
    found.test.questionCount = next.length;
    touchExamForTest(testSlug);
    persistCatalog();
  }
  persistQuestions();
  return next;
}

export function saveQuestion(input: {
  id?: string;
  testSlug: string;
  prompt: string;
  explanation: string;
  difficulty: string;
  category: string;
  tags: string[];
  type: "SINGLE_CHOICE" | "MULTIPLE_CHOICE";
  options: Array<{ id?: string; label: string; body: string; isCorrect: boolean }>;
  isFree?: boolean;
  status?: QuestionStatus;
  imageUrl?: string;
}) {
  const current = getLiveQuestions(input.testSlug);
  const existing = input.id ? current.find((item) => item.id === input.id) : undefined;
  const options = input.options
    .filter((option) => option.body.trim())
    .map((option, index) => ({
      id:
        option.id ||
        existing?.options.find((item) => item.label === option.label)?.id ||
        `${input.testSlug}-opt-${randomBytes(3).toString("hex")}`,
      label: option.label || ["A", "B", "C", "D", "E"][index] || String(index + 1),
      body: option.body.trim(),
      isCorrect: option.isCorrect,
    }));
  if (options.length < 2) {
    throw new Error("OPTIONS");
  }
  if (!options.some((option) => option.isCorrect)) {
    throw new Error("CORRECT");
  }
  const record: LiveQuestion = {
    id: input.id ?? `${input.testSlug}-q${randomBytes(4).toString("hex")}`,
    order: existing?.order ?? current.length + 1,
    type: input.type,
    prompt: input.prompt.trim(),
    explanation: input.explanation.trim(),
    options,
    difficulty: normalizeDifficulty(input.difficulty),
    category: input.category.trim() || "General",
    tags: input.tags.map((tag) => tag.trim()).filter(Boolean),
    testSlug: input.testSlug,
    isFree: input.isFree ?? existing?.isFree ?? false,
    status: input.status ?? existing?.status ?? "published",
    imageUrl: input.imageUrl?.trim() || existing?.imageUrl,
    updatedAt: nowIso(),
    version: existing ? bumpMinorVersion(existing.version) : "1.0",
  };
  const index = current.findIndex((item) => item.id === record.id);
  const next = [...current];
  if (index >= 0) {
    next[index] = { ...record, order: current[index]!.order };
  } else {
    next.push(record);
  }
  persistBank(input.testSlug, next);
  return record;
}

function bumpMinorVersion(version?: string) {
  const cleaned = String(version || "1.0").replace(/^v/i, "");
  const [major, minor] = cleaned.split(".");
  return `${Number(major) || 1}.${(Number(minor) || 0) + 1}`;
}

export function deleteQuestion(id: string) {
  const question = getQuestionAdmin(id);
  if (!question) {
    return;
  }
  persistBank(
    question.testSlug,
    getLiveQuestions(question.testSlug).filter((item) => item.id !== id),
  );
}

export function importQuestions(testSlug: string, questions: LiveQuestion[]) {
  const current = getLiveQuestions(testSlug);
  persistBank(
    testSlug,
    [
      ...current,
      ...questions.map((question, index) =>
        normalizeQuestion(question, testSlug, current.length + index),
      ),
    ],
  );
}

export function listExamQuestions(vendorSlug: string, examSlug: string) {
  const exam = getExamAdmin(vendorSlug, examSlug);
  if (!exam) {
    return [];
  }
  const seen = new Set<string>();
  const items: LiveQuestion[] = [];
  for (const test of exam.tests) {
    for (const question of getLiveQuestions(test.slug)) {
      if (seen.has(question.id)) {
        continue;
      }
      seen.add(question.id);
      items.push(question);
    }
  }
  return items.sort((a, b) => a.order - b.order);
}

export type QuestionQuery = {
  vendor?: string;
  exam?: string;
  testSlug?: string;
  tier?: "free" | "premium";
  difficulty?: string;
  category?: string;
  status?: QuestionStatus;
  q?: string;
  sort?: "newest" | "oldest" | "number";
  page?: number;
  pageSize?: number;
};

export function queryQuestionsAdmin(query: QuestionQuery) {
  let items = query.testSlug
    ? getLiveQuestions(query.testSlug)
    : query.exam
      ? exams()
          .filter((exam) => exam.slug === query.exam && (!query.vendor || exam.vendorSlug === query.vendor))
          .flatMap((exam) => listExamQuestions(exam.vendorSlug, exam.slug))
      : listQuestionsAdmin();

  if (query.vendor && !query.exam && !query.testSlug) {
    const examSlugs = exams()
      .filter((exam) => exam.vendorSlug === query.vendor)
      .flatMap((exam) => exam.tests.map((test) => test.slug));
    items = items.filter((item) => examSlugs.includes(item.testSlug));
  }
  if (query.tier === "free") {
    items = items.filter((item) => item.isFree);
  }
  if (query.tier === "premium") {
    items = items.filter((item) => !item.isFree);
  }
  if (query.difficulty) {
    items = items.filter((item) => item.difficulty.toLowerCase() === query.difficulty!.toLowerCase());
  }
  if (query.category) {
    items = items.filter((item) => item.category.toLowerCase() === query.category!.toLowerCase());
  }
  if (query.status) {
    items = items.filter((item) => item.status === query.status);
  }
  if (query.q?.trim()) {
    const needle = query.q.trim().toLowerCase();
    items = items.filter(
      (item) =>
        item.prompt.toLowerCase().includes(needle) ||
        item.category.toLowerCase().includes(needle) ||
        item.tags.some((tag) => tag.toLowerCase().includes(needle)),
    );
  }

  const sort = query.sort ?? "number";
  items = items.slice().sort((a, b) => {
    if (sort === "newest") {
      return b.updatedAt.localeCompare(a.updatedAt);
    }
    if (sort === "oldest") {
      return a.updatedAt.localeCompare(b.updatedAt);
    }
    return a.order - b.order;
  });

  const pageSize = Math.max(1, Math.min(query.pageSize ?? 25, 100));
  const page = Math.max(1, query.page ?? 1);
  const start = (page - 1) * pageSize;
  return {
    total: items.length,
    page,
    pageSize,
    items: items.slice(start, start + pageSize),
    allIds: items.map((item) => item.id),
  };
}

export function reorderQuestions(testSlug: string, orderedIds: string[]) {
  const current = getLiveQuestions(testSlug);
  const byId = new Map(current.map((item) => [item.id, item]));
  const next = [
    ...orderedIds.map((id) => byId.get(id)).filter((item): item is LiveQuestion => Boolean(item)),
    ...current.filter((item) => !orderedIds.includes(item.id)),
  ];
  persistBank(testSlug, next);
}

export function bulkUpdateQuestions(
  ids: string[],
  action:
    | "publish"
    | "unpublish"
    | "delete"
    | "mark_free"
    | "mark_premium"
    | "category"
    | "difficulty",
  value?: string,
) {
  const grouped = new Map<string, LiveQuestion[]>();
  for (const id of ids) {
    const question = getQuestionAdmin(id);
    if (!question) {
      continue;
    }
    const list = grouped.get(question.testSlug) ?? [];
    list.push(question);
    grouped.set(question.testSlug, list);
  }

  for (const [testSlug, subset] of grouped) {
    const idSet = new Set(subset.map((item) => item.id));
    if (action === "delete") {
      persistBank(
        testSlug,
        getLiveQuestions(testSlug).filter((item) => !idSet.has(item.id)),
      );
      continue;
    }
    persistBank(
      testSlug,
      getLiveQuestions(testSlug).map((item) => {
        if (!idSet.has(item.id)) {
          return item;
        }
        if (action === "publish") {
          return { ...item, status: "published", updatedAt: nowIso() };
        }
        if (action === "unpublish") {
          return { ...item, status: "draft", updatedAt: nowIso() };
        }
        if (action === "mark_free") {
          return { ...item, isFree: true, updatedAt: nowIso() };
        }
        if (action === "mark_premium") {
          return { ...item, isFree: false, updatedAt: nowIso() };
        }
        if (action === "category" && value) {
          return { ...item, category: value, updatedAt: nowIso() };
        }
        if (action === "difficulty" && value) {
          return { ...item, difficulty: normalizeDifficulty(value), updatedAt: nowIso() };
        }
        return item;
      }),
    );
  }
}

export function setPaperQuestionIds(testSlug: string, questionIds: string[]) {
  const found = getTestAdmin(testSlug);
  if (!found) {
    throw new Error("NOT_FOUND");
  }
  found.test.questionIds = questionIds;
  found.test.selectionMethod = "FIXED";
  found.test.questionCount = questionIds.length;
  bumpExamUpdated(found.exam);
  persistCatalog();
}

export function examContentOverview(vendorSlug: string, examSlug: string) {
  const exam = getExamAdmin(vendorSlug, examSlug);
  if (!exam) {
    return null;
  }
  const questions = listExamQuestions(vendorSlug, examSlug);
  const papers = exam.tests;
  return {
    exam,
    vendor: getVendorAdmin(exam.vendorSlug),
    totalQuestions: questions.length,
    freeQuestions: questions.filter((item) => item.isFree).length,
    premiumQuestions: questions.filter((item) => !item.isFree).length,
    publishedQuestions: questions.filter((item) => item.status === "published").length,
    draftQuestions: questions.filter((item) => item.status === "draft").length,
    freePapers: papers.filter((item) => item.paperType === "FREE").length,
    premiumPapers: papers.filter((item) => item.paperType === "PREMIUM").length,
    papers,
    lastUpdated: exam.updatedAt,
    contentVersion: exam.contentVersion,
    published: exam.isPublished,
  };
}

export function questionsToCsv(questions: LiveQuestion[]) {
  const header = [
    "question",
    "option_a",
    "option_b",
    "option_c",
    "option_d",
    "option_e",
    "correct_answer",
    "explanation",
    "difficulty",
    "category",
    "question_type",
    "is_free",
    "status",
    "tags",
  ];
  const rows = questions.map((question) => {
    const bodies = ["A", "B", "C", "D", "E"].map(
      (label) => question.options.find((option) => option.label === label)?.body ?? "",
    );
    const correct = question.options
      .filter((option) => option.isCorrect)
      .map((option) => option.label)
      .join(";");
    const cells = [
      question.prompt,
      ...bodies,
      correct,
      question.explanation,
      question.difficulty,
      question.category,
      question.type === "MULTIPLE_CHOICE" ? "multiple" : "single",
      question.isFree ? "true" : "false",
      question.status,
      question.tags.join(";"),
    ];
    return cells.map(csvEscape).join(",");
  });
  return [header.join(","), ...rows].join("\n");
}

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export { normalizeDifficulty };
