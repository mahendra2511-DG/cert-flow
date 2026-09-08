import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { seedCategories, seedExams, seedVendors } from "../src/lib/catalog/seed-catalog";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.log("DATABASE_URL is not set. Seed data still powers the UI via src/lib/catalog/seed-catalog.ts.");
    return;
  }

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });

  await prisma.certificationFaq.deleteMany();
  await prisma.certificationOutcome.deleteMany();
  await prisma.certificationCategory.deleteMany();
  await prisma.questionOption.deleteMany();
  await prisma.question.deleteMany();
  await prisma.practiceTest.deleteMany();
  await prisma.certification.deleteMany();
  await prisma.category.deleteMany();
  await prisma.provider.deleteMany();

  for (const vendor of seedVendors) {
    await prisma.provider.create({ data: vendor });
  }

  for (const category of seedCategories) {
    await prisma.category.create({
      data: {
        slug: category.slug,
        name: category.name,
        description: category.description,
        accent: category.accent,
      },
    });
  }

  const providers = await prisma.provider.findMany();
  const categories = await prisma.category.findMany();
  const providerId = Object.fromEntries(providers.map((item) => [item.slug, item.id]));
  const categoryId = Object.fromEntries(categories.map((item) => [item.slug, item.id]));

  for (const exam of seedExams) {
    const certification = await prisma.certification.create({
      data: {
        slug: exam.slug,
        code: exam.code,
        name: exam.name,
        summary: exam.summary,
        description: exam.description,
        level: exam.level,
        durationMin: exam.durationMin,
        passingScore: exam.passingScore,
        language: exam.language,
        examFormat: exam.examFormat,
        isPopular: exam.isPopular,
        seoTitle: exam.seoTitle,
        seoDescription: exam.seoDescription,
        providerId: providerId[exam.vendorSlug],
        outcomes: {
          create: exam.outcomes.map((body, order) => ({ body, order })),
        },
        faqs: {
          create: exam.faqs.map((faq, order) => ({
            question: faq.question,
            answer: faq.answer,
            order,
          })),
        },
        categories: {
          create: exam.categorySlugs
            .filter((slug) => categoryId[slug])
            .map((slug) => ({ categoryId: categoryId[slug] })),
        },
        practiceTests: {
          create: exam.tests.map((test) => ({
            slug: test.slug,
            title: test.title,
            summary: test.summary,
            description: test.description,
            questionCount: test.questionCount,
            timeLimitMin: test.timeLimitMin,
            passingScore: test.passingScore,
            pricePaise: test.pricePaise,
            ratingAverage: test.ratingAverage,
            ratingCount: test.ratingCount,
            isPopular: test.isPopular,
            isPublished: true,
          })),
        },
      },
    });
    void certification;
  }

  console.log(`Seeded ${seedVendors.length} vendors and ${seedExams.length} exams.`);
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
