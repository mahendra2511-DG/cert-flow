import { prisma } from "@/lib/db";
import {
  examPath,
  seedCategories,
  seedExams,
  seedSiteFaqs,
  seedTestimonials,
  seedVendors,
  type SeedExam,
} from "@/lib/catalog/seed-catalog";
import { getQuestionsForTest } from "@/lib/exam/questions";
import type { CatalogCategory, CatalogFaq, CatalogPracticeTest, CatalogTestimonial } from "@/lib/catalog/types";

export const CATALOG_PAGE_SIZE = 6;

export type ExamSort = "popular" | "rating" | "price-asc" | "price-desc" | "name";

export type ExamListing = {
  vendorSlug: string;
  vendorName: string;
  examSlug: string;
  href: string;
  code: string;
  name: string;
  summary: string;
  questionCount: number;
  practiceTestCount: number;
  pricePaise: number;
  ratingAverage: number;
  ratingCount: number;
  isPopular: boolean;
  categorySlugs: string[];
  primaryTestSlug: string;
};

export type ExamDetail = ExamListing & {
  description: string;
  level: string;
  durationMin: number;
  passingScore: number;
  language: string;
  examFormat: string;
  outcomes: string[];
  faqs: CatalogFaq[];
  seoTitle: string;
  seoDescription: string;
  tests: CatalogPracticeTest[];
  vendorDescription: string;
  vendorLongDescription: string;
};

export type VendorDetail = {
  slug: string;
  name: string;
  description: string;
  longDescription: string;
  categories: Array<{ slug: string; name: string; examCount: number }>;
  exams: ExamListing[];
};

export type ListExamsInput = {
  q?: string;
  vendor?: string;
  category?: string;
  sort?: ExamSort;
  page?: number;
  pageSize?: number;
  popularOnly?: boolean;
};

function toListing(exam: SeedExam): ExamListing {
  const vendor = seedVendors.find((item) => item.slug === exam.vendorSlug);
  const tests = exam.tests;
  const questionCount = tests.reduce(
    (sum, test) => sum + getQuestionsForTest(test.slug).length,
    0,
  );
  const pricePaise = Math.min(...tests.map((test) => test.pricePaise));
  const ratingCount = tests.reduce((sum, test) => sum + test.ratingCount, 0);
  const ratingAverage =
    ratingCount === 0
      ? 0
      : tests.reduce((sum, test) => sum + test.ratingAverage * test.ratingCount, 0) / ratingCount;
  const primary = [...tests].sort((a, b) => a.pricePaise - b.pricePaise)[0];

  return {
    vendorSlug: exam.vendorSlug,
    vendorName: vendor?.name ?? exam.vendorSlug,
    examSlug: exam.slug,
    href: examPath(exam.vendorSlug, exam.slug),
    code: exam.code,
    name: exam.name,
    summary: exam.summary,
    questionCount,
    practiceTestCount: tests.length,
    pricePaise,
    ratingAverage: Math.round(ratingAverage * 10) / 10,
    ratingCount,
    isPopular: exam.isPopular,
    categorySlugs: exam.categorySlugs,
    primaryTestSlug: primary?.slug ?? "",
  };
}

function matchesQuery(exam: SeedExam, q: string) {
  const vendor = seedVendors.find((item) => item.slug === exam.vendorSlug);
  const haystack = [
    exam.name,
    exam.code,
    exam.summary,
    exam.slug,
    exam.vendorSlug,
    vendor?.name,
    ...exam.categorySlugs,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

function sortListings(items: ExamListing[], sort: ExamSort) {
  const copy = [...items];
  copy.sort((a, b) => {
    switch (sort) {
      case "price-asc":
        return a.pricePaise - b.pricePaise;
      case "price-desc":
        return b.pricePaise - a.pricePaise;
      case "rating":
        return b.ratingAverage - a.ratingAverage;
      case "name":
        return a.name.localeCompare(b.name);
      default:
        if (a.isPopular !== b.isPopular) {
          return a.isPopular ? -1 : 1;
        }
        return b.ratingCount - a.ratingCount;
    }
  });
  return copy;
}

export async function listExams(input: ListExamsInput = {}) {
  const q = input.q?.trim().toLowerCase() ?? "";
  const sort = input.sort ?? "popular";
  const pageSize = input.pageSize ?? CATALOG_PAGE_SIZE;
  const page = Math.max(1, input.page ?? 1);

  let exams = seedExams.slice();
  if (input.vendor) {
    exams = exams.filter((exam) => exam.vendorSlug === input.vendor);
  }
  if (input.category) {
    exams = exams.filter((exam) => exam.categorySlugs.includes(input.category!));
  }
  if (q) {
    exams = exams.filter((exam) => matchesQuery(exam, q));
  }
  if (input.popularOnly) {
    exams = exams.filter((exam) => exam.isPopular);
  }

  const listings = sortListings(exams.map(toListing), sort);
  const total = listings.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, pageCount);
  const start = (safePage - 1) * pageSize;

  return {
    items: listings.slice(start, start + pageSize),
    total,
    page: safePage,
    pageCount,
    pageSize,
  };
}

export async function getVendor(slug: string): Promise<VendorDetail | null> {
  const vendor = seedVendors.find((item) => item.slug === slug);
  if (!vendor) {
    return null;
  }

  const exams = seedExams.filter((exam) => exam.vendorSlug === slug).map(toListing);
  const categoryCounts = new Map<string, number>();
  for (const exam of seedExams.filter((item) => item.vendorSlug === slug)) {
    for (const categorySlug of exam.categorySlugs) {
      categoryCounts.set(categorySlug, (categoryCounts.get(categorySlug) ?? 0) + 1);
    }
  }

  const categories = seedCategories
    .filter((category) => categoryCounts.has(category.slug))
    .map((category) => ({
      slug: category.slug,
      name: category.name,
      examCount: categoryCounts.get(category.slug) ?? 0,
    }));

  return {
    slug: vendor.slug,
    name: vendor.name,
    description: vendor.description,
    longDescription: vendor.longDescription,
    categories,
    exams,
  };
}

export async function getExam(vendorSlug: string, examSlug: string): Promise<ExamDetail | null> {
  const exam = seedExams.find((item) => item.vendorSlug === vendorSlug && item.slug === examSlug);
  if (!exam) {
    return null;
  }
  const vendor = seedVendors.find((item) => item.slug === vendorSlug);
  const listing = toListing(exam);

  return {
    ...listing,
    description: exam.description,
    level: exam.level,
    durationMin: exam.durationMin,
    passingScore: exam.passingScore,
    language: exam.language,
    examFormat: exam.examFormat,
    outcomes: exam.outcomes,
    faqs: exam.faqs,
    seoTitle: exam.seoTitle,
    seoDescription: exam.seoDescription,
    vendorDescription: vendor?.description ?? "",
    vendorLongDescription: vendor?.longDescription ?? "",
    tests: exam.tests.map((test) => ({
      ...test,
      certificationSlug: exam.slug,
    })),
  };
}

export async function getRelatedExams(vendorSlug: string, examSlug: string, limit = 3) {
  const current = seedExams.find((item) => item.vendorSlug === vendorSlug && item.slug === examSlug);
  if (!current) {
    return [];
  }

  const sameVendor = seedExams
    .filter((item) => item.vendorSlug === vendorSlug && item.slug !== examSlug)
    .map(toListing);

  if (sameVendor.length >= limit) {
    return sameVendor.slice(0, limit);
  }

  const extra = seedExams
    .filter(
      (item) =>
        item.slug !== examSlug &&
        item.vendorSlug !== vendorSlug &&
        item.categorySlugs.some((category) => current.categorySlugs.includes(category)),
    )
    .map(toListing);

  return [...sameVendor, ...extra].slice(0, limit);
}

export async function listVendors() {
  return seedVendors.map((vendor) => ({
    ...vendor,
    examCount: seedExams.filter((exam) => exam.vendorSlug === vendor.slug).length,
  }));
}

export async function listFilterCategories() {
  return seedCategories.map((category) => ({
    ...category,
    examCount: seedExams.filter((exam) => exam.categorySlugs.includes(category.slug)).length,
  }));
}

export async function getHomepageContent() {
  const popularCategories: Array<CatalogCategory & { examCount: number }> = seedCategories
    .filter((category) =>
      ["microsoft", "aws", "azure", "google-cloud", "cisco", "comptia", "kubernetes"].includes(
        category.slug,
      ),
    )
    .map((category) => ({
      slug: category.slug,
      name: category.name,
      description: category.description,
      href: category.href,
      hrefQuery: category.slug === "kubernetes" ? "kubernetes" : category.slug,
      accent: category.accent,
      examCount: seedExams.filter((exam) => exam.categorySlugs.includes(category.slug)).length,
    }));

  const popularResult = await listExams({ popularOnly: true, pageSize: 6, sort: "popular" });

  return {
    popularCategories,
    popularTests: popularResult.items.flatMap((exam) => {
      const full = seedExams.find((item) => item.slug === exam.examSlug);
      return (full?.tests ?? [])
        .filter((test) => test.isPopular)
        .map((test) => ({ ...test, certificationSlug: exam.examSlug }));
    }),
    popularExams: popularResult.items,
    testimonials: seedTestimonials,
    faqs: seedSiteFaqs,
    stats: {
      exams: seedExams.length,
      questions: seedExams.reduce(
        (sum, exam) => sum + exam.tests.reduce((inner, test) => inner + test.questionCount, 0),
        0,
      ),
      sittingsLabel: "12k+",
    },
  };
}

export async function getPracticeTestBySlug(slug: string) {
  for (const exam of seedExams) {
    const test = exam.tests.find((item) => item.slug === slug);
    if (test) {
      return {
        ...test,
        certificationSlug: exam.slug,
        vendorSlug: exam.vendorSlug,
        examCode: exam.code,
        examName: exam.name,
      };
    }
  }
  return null;
}

export function catalogUsesDatabase() {
  return Boolean(prisma);
}

export const siteFaqs: CatalogFaq[] = seedSiteFaqs;
export const testimonials: CatalogTestimonial[] = seedTestimonials;
