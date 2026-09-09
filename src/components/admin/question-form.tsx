import { getQuestionAdmin, listTestsAdmin, listVendorsAdmin, listExamsAdmin, type LiveQuestion } from "@/lib/admin/catalog-store";
import { QuestionEditor } from "@/components/admin/question-editor";

export function QuestionForm({ question }: { question?: LiveQuestion | null }) {
  return (
    <QuestionEditor
      question={question ?? null}
      tests={listTestsAdmin().map((item) => ({
        slug: item.slug,
        title: item.title,
        examCode: item.examCode,
        vendorSlug: item.vendorSlug,
        examSlug: item.examSlug,
      }))}
      vendors={listVendorsAdmin().map((item) => ({ slug: item.slug, name: item.name }))}
      exams={listExamsAdmin().map((item) => ({
        vendorSlug: item.vendorSlug,
        slug: item.slug,
        code: item.code,
        name: item.name,
      }))}
    />
  );
}

export function QuestionFormById({ id }: { id?: string }) {
  const question = id ? getQuestionAdmin(id) : null;
  return <QuestionForm question={question} />;
}
