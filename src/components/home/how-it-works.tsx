import { PageContainer, SectionHeader } from "@/components/layout/page-container";

const steps = [
  { n: "01", title: "Choose your certification", body: "Pick a provider, then the exam you are actually sitting." },
  { n: "02", title: "Practice 20 free questions", body: "Start immediately. The free limit is enforced on the server." },
  { n: "03", title: "Upgrade when you need more", body: "Unlock the remaining bank, premium sittings, and the study PDF." },
  { n: "04", title: "Prepare and pass with confidence", body: "Retake weak domains with explanations and a score history." },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-y bg-muted/30 py-16 sm:py-20" aria-labelledby="how-heading">
      <PageContainer>
        <SectionHeader
          titleId="how-heading"
          eyebrow="Workflow"
          title="How it works"
          description="Four steps from catalog to premium review. No classroom enrollment."
        />
        <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <li key={step.n} className="rounded-2xl border bg-card p-5 shadow-sm">
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
