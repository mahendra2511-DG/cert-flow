import Link from "next/link";
import { notFound } from "next/navigation";
import type { Route } from "next";
import { Breadcrumbs } from "@/components/catalog/breadcrumbs";
import { ExamCard } from "@/components/catalog/exam-card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageContainer } from "@/components/layout/page-container";
import { StarRating } from "@/components/catalog/star-rating";
import { getExam, getRelatedExams } from "@/lib/catalog/repository";
import { seedExams } from "@/lib/catalog/seed-catalog";
import { createMetadata } from "@/lib/seo";
import { formatInrFromPaise } from "@/lib/utils";
import { Check } from "lucide-react";

export async function generateStaticParams() {
  return seedExams.map((exam) => ({
    vendor: exam.vendorSlug,
    exam: exam.slug,
  }));
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
      title: "Exam not found",
      description: "That certification exam is not in the PrepHarbor catalog.",
      path: `/certifications/${vendor}/${exam}`,
      noIndex: true,
    });
  }

  return createMetadata({
    title: detail.seoTitle,
    description: detail.seoDescription,
    path: detail.href,
  });
}

export default async function ExamDetailPage({
  params,
}: {
  params: Promise<{ vendor: string; exam: string }>;
}) {
  const { vendor, exam } = await params;
  const detail = await getExam(vendor, exam);
  if (!detail) {
    notFound();
  }

  const related = await getRelatedExams(vendor, exam);
  const checkoutHref = `/checkout/${detail.primaryTestSlug}` as Route;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: `${detail.code} ${detail.name}`,
    description: detail.seoDescription,
    provider: {
      "@type": "Organization",
      name: "PrepHarbor",
    },
  };

  return (
    <PageContainer className="py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: "/certifications", label: "Certifications" },
          { href: `/certifications/${detail.vendorSlug}`, label: detail.vendorName },
          { label: detail.code },
        ]}
      />

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_18rem]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{detail.code}</Badge>
            <Badge variant="secondary">{detail.vendorName}</Badge>
            <Badge variant="outline">{detail.level}</Badge>
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{detail.name}</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">{detail.description}</p>
          <div className="mt-4">
            <StarRating value={detail.ratingAverage} count={detail.ratingCount} />
          </div>

          <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl border bg-card p-4">
              <dt className="text-xs text-muted-foreground">Questions</dt>
              <dd className="text-xl font-semibold">{detail.questionCount}</dd>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <dt className="text-xs text-muted-foreground">Practice tests</dt>
              <dd className="text-xl font-semibold">{detail.practiceTestCount}</dd>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <dt className="text-xs text-muted-foreground">Duration</dt>
              <dd className="text-xl font-semibold">{detail.durationMin} min</dd>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <dt className="text-xs text-muted-foreground">From</dt>
              <dd className="text-xl font-semibold">{formatInrFromPaise(detail.pricePaise)}</dd>
            </div>
          </dl>

          <section className="mt-12" aria-labelledby="learn-heading">
            <h2 id="learn-heading" className="text-2xl font-semibold">
              What you’ll learn
            </h2>
            <ul className="mt-4 space-y-3">
              {detail.outcomes.map((outcome) => (
                <li key={outcome} className="flex gap-3 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                  {outcome}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-12" aria-labelledby="info-heading">
            <h2 id="info-heading" className="text-2xl font-semibold">
              Exam information
            </h2>
            <dl className="mt-4 divide-y rounded-2xl border">
              {[
                ["Level", detail.level],
                ["Format", detail.examFormat],
                ["Language", detail.language],
                ["Passing score", `${detail.passingScore}%`],
                ["Timed sitting", `${detail.durationMin} minutes`],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-12" aria-labelledby="exam-faq-heading">
            <h2 id="exam-faq-heading" className="text-2xl font-semibold">
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

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle>Purchase access</CardTitle>
              <CardDescription>
                Unlock the online exam, retakes, and explanation review.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-3xl font-semibold">{formatInrFromPaise(detail.pricePaise)}</p>
              <Button
                nativeButton={false}
                render={<Link href={`/practice-test/${detail.vendorSlug}/${detail.examSlug}` as Route} />}
                className="w-full"
              >
                Start / view practice test
              </Button>
              <Button nativeButton={false} render={<Link href={checkoutHref} />} variant="outline" className="w-full">
                Continue to checkout
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>

      {related.length > 0 ? (
        <section className="mt-16" aria-labelledby="related-heading">
          <h2 id="related-heading" className="text-2xl font-semibold">
            Related certifications
          </h2>
          <ul className="mt-4 grid gap-4 md:grid-cols-3">
            {related.map((item) => (
              <li key={item.examSlug}>
                <ExamCard exam={item} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </PageContainer>
  );
}
