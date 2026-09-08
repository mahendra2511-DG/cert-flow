import { notFound } from "next/navigation";
import { ExamForm } from "@/components/admin/exam-form";
import { getExamAdmin } from "@/lib/admin/catalog-store";

export default async function EditExamPage({
  params,
}: {
  params: Promise<{ vendor: string; exam: string }>;
}) {
  const { vendor, exam } = await params;
  const record = getExamAdmin(vendor, exam);
  if (!record) {
    notFound();
  }
  return <ExamForm exam={record} />;
}
