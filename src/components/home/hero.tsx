import Link from "next/link";
import { CatalogSearch } from "@/components/catalog/search-form";
import { PageContainer } from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { route } from "@/lib/routes";
import { Check } from "lucide-react";

const trustItems = [
  "20 free questions",
  "Detailed explanations",
  "Updated question banks",
  "Instant results",
];

export function HomeHero({
  examCount,
  questionCount,
  sittingsLabel,
}: {
  examCount: number;
  questionCount: number;
  sittingsLabel: string;
}) {
  return (
    <section className="relative overflow-hidden border-b">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,oklch(0.88_0.08_275),transparent_42%),radial-gradient(circle_at_85%_10%,oklch(0.92_0.06_250),transparent_34%),linear-gradient(180deg,oklch(0.985_0.02_275),transparent)]"
      />
      <PageContainer className="relative py-16 lg:py-24">
        <Badge variant="secondary" className="h-6 px-2.5">
          Independent practice marketplace
        </Badge>
        <h1 className="mt-5 max-w-3xl text-4xl leading-[1.1] font-semibold tracking-tight sm:text-5xl lg:text-6xl">
          Practice. Prepare. Certify.
        </h1>
        <p className="mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Practice with high-quality certification questions, detailed explanations, and realistic
          exam simulations. Start with 20 free questions on every published exam.
        </p>
        <div className="mt-8 max-w-2xl">
          <CatalogSearch size="lg" id="hero-search" submitLabel="Search exams" />
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button nativeButton={false} render={<Link href="/certifications" />} size="lg">
            Explore certifications
          </Button>
          <Button nativeButton={false} render={<Link href={route("/free-questions")} />} variant="outline" size="lg">
            Start free practice
          </Button>
        </div>
        <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium">
          {trustItems.map((item) => (
            <li key={item} className="flex items-center gap-2">
              <Check className="size-4 text-primary" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
        <dl className="mt-10 grid max-w-xl grid-cols-3 gap-4 border-t pt-6">
          <div>
            <dt className="text-xs text-muted-foreground">Exams in catalog</dt>
            <dd className="text-2xl font-semibold tabular-nums">{examCount}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Practice questions</dt>
            <dd className="text-2xl font-semibold tabular-nums">{questionCount}+</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Sittings completed</dt>
            <dd className="text-2xl font-semibold">{sittingsLabel}</dd>
          </div>
        </dl>
      </PageContainer>
    </section>
  );
}
