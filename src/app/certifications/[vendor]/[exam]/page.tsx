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
import { createMetadata, practiceTestPath } from "@/lib/seo";
import { examAudienceCopy, examPrepCopy } from "@/lib/seo/copy";
import { JsonLd } from "@/components/seo/json-ld";
import { courseJsonLd, examProductJsonLd, faqJsonLd } from "@/lib/seo/structured-data";
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
    title: detail.seoTitle || `${detail.code} ${detail.name} practice test`,
    description:
      detail.seoDescription ||
      `Timed ${detail.code} practice on PrepHarbor: ${detail.summary} ${detail.durationMin} minutes, original questions, INR checkout.`,
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
  const practiceHref = practiceTestPath(detail.vendorSlug, detail.examSlug) as Route;
  const examFaqs = [
    ...detail.faqs,
    {
      question: `How long is the ${detail.code} sitting on PrepHarbor?`,
      answer: `The published practice test is ${detail.durationMin} minutes with a ${detail.passingScore}% pass mark. Time remaining is shown in the exam chrome and the sitting auto-submits at zero.`,
    },
  ];

  return (
    <PageContainer className="py-10">
      <JsonLd
        data={courseJsonLd({
          name: `${detail.code} ${detail.name}`,
          description: detail.seoDescription || detail.description,
          url: detail.href,
        })}
      />
      <JsonLd
        data={examProductJsonLd({
          name: `${detail.code} practice test`,
          description: detail.seoDescription || detail.description,
          url: detail.href,
          pricePaise: detail.pricePaise,
          ratingAverage: detail.ratingAverage,
          ratingCount: detail.ratingCount,
        })}
      />
      <JsonLd data={faqJsonLd(examFaqs)} />
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
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            {detail.code} {detail.name} practice
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">{detail.description}</p>
          <div className="mt-4">
            <StarRating value={detail.ratingAverage} count={detail.ratingCount} />
          </div>

          <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl border bg-card p-4">
              <dt className="text-xs text-muted-foreground">Free questions</dt>
              <dd className="text-xl font-semibold">{detail.freeQuestionCount}</dd>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <dt className="text-xs text-muted-foreground">Premium questions</dt>
              <dd className="text-xl font-semibold">{detail.premiumQuestionCount}</dd>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <dt className="text-xs text-muted-foreground">Duration</dt>
              <dd className="text-xl font-semibold">{detail.durationMin} min</dd>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <dt className="text-xs text-muted-foreground">Premium from</dt>
              <dd className="text-xl font-semibold">{formatInrFromPaise(detail.pricePaise)}</dd>
            </div>
          </dl>

          <section className="mt-12" aria-labelledby="compare-heading">
            <h2 id="compare-heading" className="text-2xl font-semibold">
              Free vs premium
            </h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border bg-card p-5">
                <p className="text-sm font-medium text-primary">Free</p>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li>{detail.freeQuestionCount} questions</li>
                  <li>Basic practice</li>
                  <li>Answer review</li>
                  <li>Basic explanations after submit</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
                <p className="text-sm font-medium text-primary">Premium</p>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li>Full question bank</li>
                  <li>All premium questions</li>
                  <li>Premium practice tests</li>
                  <li>Detailed explanations</li>
                  <li>PDF download</li>
                  <li>Progress tracking and retakes</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mt-12" aria-labelledby="audience-heading">
            <h2 id="audience-heading" className="text-2xl font-semibold">
              Who this practice is for
            </h2>
            <p className="mt-3 text-muted-foreground">{examAudienceCopy(detail)}</p>
          </section>

          <section className="mt-12" aria-labelledby="learn-heading">
            <h2 id="learn-heading" className="text-2xl font-semibold">
              What you’ll practice
            </h2>
            <p className="mt-3 text-muted-foreground">{examPrepCopy(detail)}</p>
            <ul className="mt-4 space-y-3">
              {detail.outcomes.map((outcome) => (
                <li key={outcome} className="flex gap-3 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                  <span>
                    <span className="font-medium text-foreground">{outcome}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-12" aria-labelledby="tests-heading">
            <h2 id="tests-heading" className="text-2xl font-semibold">
              Practice tests
            </h2>
            <p className="mt-3 text-muted-foreground">
              Open a test for the timed format, then check out in INR. Access stays on the account
              that paid.
            </p>
            <ul className="mt-4 space-y-3">
              {detail.tests.map((test) => (
                <li key={test.slug} className="rounded-2xl border p-4">
                  <h3 className="font-semibold">
                    <Link href={practiceHref} className="hover:underline">
                      {test.title}
                    </Link>
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">{test.summary}</p>
                  <p className="mt-2 text-sm">
                    {test.questionCount} questions · {test.timeLimitMin} min ·{" "}
                    {formatInrFromPaise(test.pricePaise)}
                  </p>
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
              {examFaqs.map((item) => (
                <AccordionItem key={item.question} value={item.question}>
                  <AccordionTrigger>{item.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Start 20 free questions</CardTitle>
              <CardDescription>No payment required. Question 21+ stays locked until you upgrade.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                nativeButton={false}
                className="w-full"
                render={<Link href={`/practice-test/${detail.vendorSlug}/${detail.examSlug}/free` as Route} />}
              >
                Start Free Practice
              </Button>
            </CardContent>
          </Card>
          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle>Premium practice package</CardTitle>
              <CardDescription>Unlock all available questions and study material.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-3xl font-semibold">{formatInrFromPaise(detail.pricePaise)}</p>
              <Button nativeButton={false} render={<Link href={checkoutHref} />} className="w-full">
                Buy now
              </Button>
              <Button
                nativeButton={false}
                render={<Link href={`/practice-test/${detail.vendorSlug}/${detail.examSlug}/premium` as Route} />}
                variant="outline"
                className="w-full"
              >
                Unlock premium
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
