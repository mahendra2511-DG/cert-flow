import { PageContainer, SectionHeader } from "@/components/layout/page-container";

const steps = [
  {
    n: "01",
    title: "Choose an exam",
    body: "Search the catalog by vendor or code. Open a certification to compare available practice tests.",
  },
  {
    n: "02",
    title: "Purchase access",
    body: "Pay once in INR. Access unlocks the online exam, retakes, and explanation review.",
  },
  {
    n: "03",
    title: "Practice under time",
    body: "Sit the test in the browser. Flag items, move between questions, and submit when you are ready.",
  },
  {
    n: "04",
    title: "Track progress",
    body: "Scores and missed questions land in your library so the next sitting is more focused.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-y bg-muted/30 py-16 sm:py-20" aria-labelledby="how-heading">
      <PageContainer>
        <SectionHeader
          titleId="how-heading"
          eyebrow="Workflow"
          title="How it works"
          description="Four steps from catalog to review. No classroom enrollment, no shipping a workbook."
        />
        <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <li key={step.n} className="rounded-2xl border bg-card p-5">
              <p className="font-mono text-xs font-medium tracking-widest text-primary">{step.n}</p>
              <h3 className="mt-3 font-heading text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>
      </PageContainer>
    </section>
  );
}
