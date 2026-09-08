import {
  categories,
  certifications,
  faqs,
  practiceTests,
  testimonials,
} from "@/lib/catalog/data";
import type { CatalogCategory, CatalogPracticeTest } from "@/lib/catalog/types";

/**
 * Homepage/catalog accessors. Replace the bodies with Prisma when the database is live.
 */
export async function getPopularCategories(): Promise<
  Array<CatalogCategory & { examCount: number }>
> {
  return categories.map((category) => {
    const needle = category.hrefQuery.toLowerCase();
    const examCount = certifications.filter(
      (cert) =>
        cert.tags.some((tag) => tag.toLowerCase().includes(needle)) ||
        cert.tags.includes(category.slug),
    ).length;

    return { ...category, examCount };
  });
}

export async function getPopularPracticeTests(): Promise<CatalogPracticeTest[]> {
  return practiceTests.filter((item) => item.isPopular);
}

export async function getHomepageContent() {
  const [popularCategories, popularTests] = await Promise.all([
    getPopularCategories(),
    getPopularPracticeTests(),
  ]);

  return {
    popularCategories,
    popularTests,
    testimonials,
    faqs,
    stats: {
      exams: certifications.length,
      questions: practiceTests.reduce((sum, item) => sum + item.questionCount, 0),
      sittingsLabel: "12k+",
    },
  };
}
