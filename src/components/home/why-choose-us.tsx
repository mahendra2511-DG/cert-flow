import { BookOpenCheck, Gauge, ListChecks, RefreshCw, Sparkles } from "lucide-react";
import { PageContainer, SectionHeader } from "@/components/layout/page-container";

const reasons = [
  {
    icon: BookOpenCheck,
    title: "Realistic practice",
    body: "Timed sittings that follow public skill outlines. Items are scenarios, not trivia flashcards.",
  },
  {
    icon: ListChecks,
    title: "Detailed explanations",
    body: "Every question ships with a rationale so you can see why a near-miss option fails.",
  },
  {
    icon: Gauge,
    title: "Instant results",
    body: "Submit and get a score, domain breakdown, and a review list without waiting on a PDF.",
  },
  {
    icon: RefreshCw,
    title: "Updated questions",
    body: "Authors refresh sets when vendor outlines change. You keep access to the latest published version.",
  },
  {
    icon: Sparkles,
    title: "Progress tracking",
    body: "Retakes and attempt history live in your library so you can focus on weak domains.",
  },
];

export function WhyChooseUs() {
  return (
    <section className="py-16 sm:py-20" aria-labelledby="why-heading">
      <PageContainer>
        <SectionHeader
          titleId="why-heading"
          eyebrow="Why PrepHarbor"
          title="Built for how professionals actually study"
          description="The product is the loop: pick an exam, sit it under time, read the explanations, and come back to the domains you missed."
        />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {reasons.map((reason) => (
            <li
              key={reason.title}
              className="rounded-2xl border bg-card p-5 transition-colors hover:border-primary/30 hover:bg-accent/40"
            >
              <reason.icon className="size-5 text-primary" aria-hidden="true" />
              <h3 className="mt-3 font-heading text-base font-semibold">{reason.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{reason.body}</p>
            </li>
          ))}
        </ul>
      </PageContainer>
    </section>
  );
}
