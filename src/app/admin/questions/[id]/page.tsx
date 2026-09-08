import { notFound } from "next/navigation";
import { QuestionForm } from "@/components/admin/question-form";
import { getQuestionAdmin } from "@/lib/admin/catalog-store";

export default async function EditQuestionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const question = getQuestionAdmin(id);
  if (!question) {
    notFound();
  }
  return <QuestionForm question={question} />;
}
