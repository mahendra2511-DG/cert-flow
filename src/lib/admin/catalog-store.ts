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

export type LiveVendor = SeedVendor & { isPublished: boolean };
export type LiveTest = SeedPracticeTest & { isPublished: boolean };
export type LiveExam = Omit<SeedExam, "tests"> & { isPublished: boolean; tests: LiveTest[] };
export type LiveQuestion = ExamQuestion & {
  difficulty: string;
  category: string;
  tags: string[];
  testSlug: string;
};

type CatalogFile = { vendors: LiveVendor[]; exams: LiveExam[] };
type QuestionFile = { banks: Record<string, LiveQuestion[]> };

const memory = globalThis as unknown as {
  __prepharborLiveVendors?: LiveVendor[];
  __prepharborLiveExams?: LiveExam[];
  __prepharborQuestionBanks?: Map<string, LiveQuestion[]>;
  __prepharborCatalogReady?: boolean;
};

function cloneSeed(): CatalogFile {
  return {
    vendors: seedVendors.map((vendor) => ({ ...vendor, isPublished: true })),
    exams: seedExams.map((exam) => ({
      ...exam,
      isPublished: true,
      freeQuestionLimit: exam.freeQuestionLimit ?? 20,
      premiumQuestionCount: exam.premiumQuestionCount,
      featured: exam.featured ?? exam.isPopular,
      categorySlugs: [...exam.categorySlugs],
      outcomes: [...exam.outcomes],
      faqs: exam.faqs.map((faq) => ({ ...faq })),
      tests: exam.tests.map((test) => ({ ...test, isPublished: true })),
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

function normalizeQuestion(question: ExamQuestion, testSlug: string, index: number): LiveQuestion {
  return {
    ...question,
    order: question.order || index + 1,
    difficulty: question.difficulty ?? "Intermediate",
    category: question.category ?? "General",
    tags: question.tags ?? [],
    testSlug,
  };
}

export function getLiveQuestions(testSlug: string): LiveQuestion[] {
  const cached = banks().get(testSlug);
  if (cached) {
    return cached;
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
      });
    }
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
    });
  }
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
  options: Array<{ label: string; body: string; isCorrect: boolean }>;
}) {
  const current = getLiveQuestions(input.testSlug);
  const options = input.options
    .filter((option) => option.body.trim())
    .map((option, index) => ({
      id: `${input.testSlug}-opt-${randomBytes(3).toString("hex")}`,
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
    order: current.length + 1,
    type: input.type,
    prompt: input.prompt.trim(),
    explanation: input.explanation.trim(),
    options,
    difficulty: input.difficulty.trim() || "Intermediate",
    category: input.category.trim() || "General",
    tags: input.tags.map((tag) => tag.trim()).filter(Boolean),
    testSlug: input.testSlug,
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
  persistBank(testSlug, [...current, ...questions]);
}
