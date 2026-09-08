import { ImportForm } from "@/components/admin/import-form";
import { listTestsAdmin } from "@/lib/admin/catalog-store";

export default function AdminQuestionImportPage() {
  const tests = listTestsAdmin().map((test) => ({
    slug: test.slug,
    title: test.title,
    examCode: test.examCode,
  }));
  return <ImportForm tests={tests} />;
}
