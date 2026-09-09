import { PageContainer, SectionHeader } from "@/components/layout/page-container";
import { CertificationSelector, type SelectorExam, type SelectorVendor } from "@/components/catalog/certification-selector";

export function FreePracticeSection({
  vendors,
  exams,
}: {
  vendors: SelectorVendor[];
  exams: SelectorExam[];
}) {
  return (
    <section id="free-practice" className="py-16 sm:py-20" aria-labelledby="free-heading">
      <PageContainer className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
        <SectionHeader
          titleId="free-heading"
          eyebrow="Free practice"
          title="Try 20 questions free"
          description="Practice the first 20 questions of any supported exam completely free. No payment is required to start."
        />
        <CertificationSelector vendors={vendors} exams={exams} cta="Start free practice" />
      </PageContainer>
    </section>
  );
}
