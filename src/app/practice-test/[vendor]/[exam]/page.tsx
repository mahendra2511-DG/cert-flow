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
import { createMetadata, practiceTestPath } from "@/lib/seo";
import { practiceSittingCopy } from "@/lib/seo/copy";
import { JsonLd } from "@/components/seo/json-ld";
import { examProductJsonLd, faqJsonLd } from "@/lib/seo/structured-data";
import { formatInrFromPaise } from "@/lib/utils";
import { Flag, ListChecks, Shield, Clock } from "lucide-react";
import { auth } from "@/auth";
import { userOwnsExam } from "@/lib/commerce/checkout";

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
    title: `${detail.code} timed practice test`,
    description: `Sit the ${detail.code} ${detail.name} practice test on PrepHarbor: timed questions, a score, and explanations after purchase.`,
    path: practiceTestPath(vendor, exam),
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
  const checkoutHref = `/checkout/${context.test.slug}` as Route;
  const examHref = `/certifications/${vendor}/${exam}` as Route;
  const sittingCopy = practiceSittingCopy({
    code: detail.code,
    vendorName: detail.vendorName,
    timeLimitMin: context.test.timeLimitMin,
    passingScore: context.test.passingScore,
    questionCount,
  });
  const faqs = [
    ...detail.faqs,
    {
      question: "When should I start the timer?",
      answer:
        "Open the start page only when you can sit the full duration. The clock begins when the attempt is created and auto-submits at zero.",
    },
  ];
  const session = await auth();
  const owned = session?.user?.id ? await userOwnsExam(session.user.id, vendor, exam) : false;

  return (
    <PageContainer className="py-10">
      <JsonLd
        data={examProductJsonLd({
          name: context.test.title,
          description: context.test.description,
          url: practiceTestPath(vendor, exam),
          pricePaise: context.test.pricePaise,
          ratingAverage: context.test.ratingAverage,
          ratingCount: context.test.ratingCount,
        })}
      />
      <JsonLd data={faqJsonLd(faqs)} />
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: "/certifications", label: "Certifications" },
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
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{sittingCopy}</p>
          <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Info label="Questions" value={String(questionCount)} />
            <Info label="Time limit" value={`${context.test.timeLimitMin} min`} />
            <Info label="Difficulty" value={detail.level} />
            <Info label="Price" value={formatInrFromPaise(context.test.pricePaise)} />
          </dl>

          <section className="mt-12" aria-labelledby="features-heading">
            <h2 id="features-heading" className="text-2xl font-semibold">
              How the sitting works
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {features.map((feature) => (
                <li key={feature.title} className="rounded-xl border bg-card p-4">
                  <feature.icon className="size-4 text-primary" aria-hidden="true" />
                  <h3 className="mt-2 font-medium">{feature.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{feature.body}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-12" aria-labelledby="after-heading">
            <h2 id="after-heading" className="text-2xl font-semibold">
              After you submit
            </h2>
            <p className="mt-3 text-muted-foreground">
              You receive a score against the {context.test.passingScore}% pass mark, a count of
              correct and missed items, and explanation review for this attempt. Retakes stay on
              the purchasing account. Read the{" "}
              <Link href={examHref} className="font-medium text-foreground underline-offset-4 hover:underline">
                {detail.code} exam page
              </Link>{" "}
              for format and related certifications.
            </p>
          </section>

          <section className="mt-12" aria-labelledby="pt-faq-heading">
            <h2 id="pt-faq-heading" className="text-2xl font-semibold">
              FAQ
            </h2>
            <Accordion className="mt-4">
              {faqs.map((item) => (
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
              <CardTitle>{owned ? "You own this test" : "Purchase access"}</CardTitle>
              <CardDescription>
                {owned
                  ? "Payment already verified. Start or continue a timed sitting from this account."
                  : "Pay once in INR. Access unlocks only after Razorpay signature verification."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-3xl font-semibold">{formatInrFromPaise(context.test.pricePaise)}</p>
              <Button
                nativeButton={false}
                render={<Link href={`/practice-test/${vendor}/${exam}/free` as Route} />}
                className="w-full"
              >
                Start 20 free questions
              </Button>
              {owned ? (
                <Button nativeButton={false} render={<Link href={`/practice-test/${vendor}/${exam}/premium` as Route} />} variant="outline" className="w-full">
                  Start premium test
                </Button>
              ) : (
                <Button nativeButton={false} render={<Link href={checkoutHref} />} variant="outline" className="w-full">
                  Unlock premium
                </Button>
              )}
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
