import {
  seedCategories,
  seedExams,
  seedSiteFaqs,
  seedTestimonials,
  seedVendors,
} from "@/lib/catalog/seed-catalog";
import type {
  CatalogCategory,
  CatalogCertification,
  CatalogPracticeTest,
} from "@/lib/catalog/types";

export const providers = seedVendors.map(({ slug, name, description }) => ({
  slug,
  name,
  description,
}));

export const categories: CatalogCategory[] = seedCategories.map((category) => ({
  slug: category.slug,
  name: category.name,
  description: category.description,
  hrefQuery: category.slug,
  accent: category.accent,
  href: category.href,
}));

export const certifications: CatalogCertification[] = seedExams.map((exam) => ({
  slug: exam.slug,
  code: exam.code,
  name: exam.name,
  summary: exam.summary,
  description: exam.description,
  level: exam.level,
  durationMin: exam.durationMin,
  providerSlug: exam.vendorSlug,
  tags: exam.categorySlugs,
}));

export const practiceTests: CatalogPracticeTest[] = seedExams.flatMap((exam) =>
  exam.tests.map((test) => ({
    ...test,
    certificationSlug: exam.slug,
  })),
);

export const testimonials = seedTestimonials;
export const faqs = seedSiteFaqs;

export function providerBySlug(slug: string) {
  return providers.find((item) => item.slug === slug);
}

export function certificationBySlug(slug: string) {
  return certifications.find((item) => item.slug === slug);
}

export function practiceTestBySlug(slug: string) {
  return practiceTests.find((item) => item.slug === slug);
}

export function testsForCertification(slug: string) {
  return practiceTests.filter((item) => item.certificationSlug === slug);
}
