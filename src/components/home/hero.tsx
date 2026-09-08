import Link from "next/link";
import { CatalogSearch } from "@/components/catalog/search-form";
import { PageContainer } from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Timer, Wallet } from "lucide-react";

const trustItems = [
  { icon: ShieldCheck, label: "Original questions, independently written" },
  { icon: Timer, label: "Timed sittings with instant score reports" },
  { icon: Wallet, label: "INR checkout through Razorpay" },
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
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,oklch(0.91_0.05_185),transparent_38%),radial-gradient(circle_at_80%_20%,oklch(0.94_0.04_95),transparent_32%),linear-gradient(180deg,oklch(0.98_0.015_95),transparent)]"
      />
      <PageContainer className="relative grid gap-10 py-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:py-20">
        <div>
          <Badge variant="secondary" className="h-6 px-2.5">
            Practice-test marketplace
          </Badge>
          <h1 className="mt-4 max-w-xl text-4xl leading-[1.12] font-semibold tracking-tight sm:text-5xl">
            Sit a realistic practice exam. See why each answer holds.
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
            PrepHarbor is an independent catalog of original certification practice tests. Search by
            vendor or exam code, purchase in INR, then take the test online and review explanations.
          </p>
          <div className="mt-8 max-w-xl">
            <CatalogSearch size="lg" id="hero-search" submitLabel="Find exams" />
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button nativeButton={false} render={<Link href="/certifications" />} variant="outline">
              Browse certifications
            </Button>
            <Button nativeButton={false} render={<Link href="/practice-tests" />} variant="ghost">
              View all practice tests
            </Button>
          </div>
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
        </div>
        <aside className="flex flex-col justify-center gap-3">
          {trustItems.map((item) => (
            <div
              key={item.label}
              className="flex items-start gap-3 rounded-2xl border bg-card/80 px-4 py-4 shadow-sm backdrop-blur-sm"
            >
              <item.icon className="mt-0.5 size-5 text-primary" aria-hidden="true" />
              <p className="text-sm font-medium leading-6">{item.label}</p>
            </div>
          ))}
          <p className="px-1 text-xs text-muted-foreground">
            Not affiliated with any certification vendor. Practice content is original to PrepHarbor.
          </p>
        </aside>
      </PageContainer>
    </section>
  );
}
