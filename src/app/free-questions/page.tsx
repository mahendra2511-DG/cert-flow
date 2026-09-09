import { PageContainer } from "@/components/layout/page-container";
import { CertificationSelector } from "@/components/catalog/certification-selector";
import { createMetadata } from "@/lib/seo";
import { getPublicExams, getPublicVendors } from "@/lib/admin/catalog-store";

export const metadata = createMetadata({
  title: "Free practice questions",
  description: "Start 20 free certification questions without payment.",
  path: "/free-questions",
});

export default function FreeQuestionsPage() {
  const vendors = getPublicVendors().map((item) => ({ slug: item.slug, name: item.name }));
  const exams = getPublicExams().map((item) => ({
    vendorSlug: item.vendorSlug,
    slug: item.slug,
    code: item.code,
    name: item.name,
  }));
  return (
    <PageContainer className="max-w-3xl py-16">
      <h1 className="text-3xl font-semibold tracking-tight">20 free questions</h1>
      <p className="mt-3 text-muted-foreground">
        Choose a provider, then an exam. The first 20 questions are free. Premium items never leave
        the server until you purchase.
      </p>
      <div className="mt-8">
        <CertificationSelector vendors={vendors} exams={exams} cta="Start free practice" />
      </div>
    </PageContainer>
  );
}
