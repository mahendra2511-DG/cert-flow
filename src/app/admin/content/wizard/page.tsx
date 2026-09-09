import { ExamSetupWizard } from "@/components/admin/exam-setup-wizard";
import { listExamsAdmin, listTestsAdmin, listVendorsAdmin } from "@/lib/admin/catalog-store";

export default function NewExamWizardPage() {
  return (
    <ExamSetupWizard
      vendors={listVendorsAdmin().map((item) => ({ slug: item.slug, name: item.name }))}
      exams={listExamsAdmin().map((item) => ({
        vendorSlug: item.vendorSlug,
        slug: item.slug,
        code: item.code,
        name: item.name,
      }))}
      tests={listTestsAdmin().map((item) => ({
        slug: item.slug,
        title: item.title,
        examCode: item.examCode,
        vendorSlug: item.vendorSlug,
        examSlug: item.examSlug,
      }))}
    />
  );
}
