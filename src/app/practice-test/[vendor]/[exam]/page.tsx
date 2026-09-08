import Link from "next/link";
import { notFound } from "next/navigation";
import type { Route } from "next";
import { Breadcrumbs } from "@/components/catalog/breadcrumbs";
import { PageContainer } from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getExam } from "@/lib/catalog/repository";
import { seedExams } from "@/lib/catalog/seed-catalog";
import { findExamContext } from "@/lib/exam/engine";
import { getQuestionsForTest } from "@/lib/exam/questions";
import { createMetadata } from "@/lib/seo";
import { formatInrFromPaise } from "@/lib/utils";
import { Flag, ListChecks, Shield, Clock } from "lucide-react";

export async function generateStaticParams() {
  return seedExams.map((item) => ({ vendor: item.vendorSlug, exam: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ vendor: string; exam: string }>;
}) {
  const { vendor, exam } = await params;
  const detail = await getExam(vendor, exam);
  if (!detail) {
    return createMetadata({
      title: "Practice test not found",
      description: "That practice test is not in the catalog.",
      path: `/practice-test/${vendor}/${exam}`,
      noIndex: true,
    });
  }
  return createMetadata({
    title: `${detail.code} practice test`,
    description: detail.seoDescription,
    path: `/practice-test/${vendor}/${exam}`,
  });
}

const features = [
  { icon: Clock, title: "Timed sitting", body: "A live clock and auto-submit when time runs out." },
  { icon: ListChecks, title: "Single and multi-select", body: "Items can require one answer or several." },
  { icon: Flag, title: "Flag and jump", body: "Mark uncertain items and move with the question grid." },
  { icon: Shield, title: "Saved progress", body: "Answers persist if you refresh mid-sitting." },
];

export default async function PracticeTestDetailPage({
  params,
}: {
  params: Promise<{ vendor: string; exam: string }>;
}) {
  const { vendor, exam } = await params;
  const detail = await getExam(vendor, exam);
  const context = findExamContext(vendor, exam);
  if (!detail || !context) {
    notFound();
  }

  const questionCount = getQuestionsForTest(context.test.slug).length;
  const startHref = `/practice-test/${vendor}/${exam}/start` as Route;
  const checkoutHref = `/checkout/${context.test.slug}` as Route;

  return (
    <PageContainer className="py-10">
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: `/certifications/${vendor}`, label: detail.vendorName },
          { href: `/certifications/${vendor}/${exam}`, label: detail.code },
          { label: "Practice test" },
        ]}
      />
      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_18rem]">
        <div>
          <div className="flex flex-wrap gap-2">
            <Badge>{detail.code}</Badge>
            <Badge variant="secondary">{detail.level}</Badge>
            <Badge variant="outline">{context.test.timeLimitMin} min</Badge>
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{context.test.title}</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">{context.test.description}</p>
          <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Info label="Questions" value={String(questionCount)} />
            <Info label="Time limit" value={`${context.test.timeLimitMin} min`} />
            <Info label="Difficulty" value={detail.level} />
            <Info label="Price" value={formatInrFromPaise(context.test.pricePaise)} />
          </dl>

          <section className="mt-12" aria-labelledby="features-heading">
            <h2 id="features-heading" className="text-2xl font-semibold">
              Features
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {features.map((feature) => (
                <li key={feature.title} className="rounded-xl border bg-card p-4">
                  <feature.icon className="size-4 text-primary" aria-hidden="true" />
                  <p className="mt-2 font-medium">{feature.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{feature.body}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-12" aria-labelledby="pt-faq-heading">
            <h2 id="pt-faq-heading" className="text-2xl font-semibold">
              FAQ
            </h2>
            <Accordion className="mt-4">
              {detail.faqs.map((item) => (
                <AccordionItem key={item.question} value={item.question}>
                  <AccordionTrigger>{item.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        </div>
        <aside>
          <Card>
            <CardHeader>
              <CardTitle>Start this sitting</CardTitle>
              <CardDescription>
                Demo access is open so you can try the engine before Razorpay checkout is connected.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-3xl font-semibold">{formatInrFromPaise(context.test.pricePaise)}</p>
              <Button nativeButton={false} render={<Link href={startHref} />} className="w-full">
                Start practice test
              </Button>
              <Button nativeButton={false} render={<Link href={checkoutHref} />} variant="outline" className="w-full">
                Purchase
              </Button>
              <p className="text-xs text-muted-foreground">
                Pass mark {context.test.passingScore}%. Timer auto-submits at zero.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </PageContainer>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-lg font-semibold">{value}</dd>
    </div>
  );
}
