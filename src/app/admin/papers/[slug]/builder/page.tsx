import { notFound } from "next/navigation";
import { PaperQuestionBuilder } from "@/components/admin/paper-question-builder";
import { getTestAdmin, listExamQuestions } from "@/lib/admin/catalog-store";

export default async function PaperBuilderPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const found = getTestAdmin(slug);
  if (!found) {
    notFound();
  }
  const questions = listExamQuestions(found.exam.vendorSlug, found.exam.slug);
  return (
    <PaperQuestionBuilder
      slug={slug}
      title={found.test.title}
      selectedIds={found.test.questionIds ?? []}
      questions={questions.map((item) => ({
        id: item.id,
        order: item.order,
        prompt: item.prompt,
        category: item.category,
        difficulty: item.difficulty,
        isFree: item.isFree,
        status: item.status,
      }))}
    />
  );
}
