import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { certificationBySlug, practiceTestBySlug } from "@/lib/catalog/data";
import { examPath } from "@/lib/catalog/seed-catalog";
import { hasRazorpay } from "@/lib/env";
import { createMetadata } from "@/lib/seo";
import { formatInrFromPaise } from "@/lib/utils";
import type { Route } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const test = practiceTestBySlug(slug);
  if (!test) {
    return createMetadata({
      title: "Practice test not found",
      description: "That practice test is not in the catalog.",
      path: `/practice-tests/${slug}`,
      noIndex: true,
    });
  }

  return createMetadata({
    title: test.title,
    description: test.summary,
    path: `/practice-tests/${test.slug}`,
  });
}

export default async function PracticeTestDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const test = practiceTestBySlug(slug);
  if (!test) {
    notFound();
  }

  const cert = certificationBySlug(test.certificationSlug);
  const paymentsReady = hasRazorpay();

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div>
        <p className="text-sm text-muted-foreground">
          <Link href="/practice-tests" className="hover:text-foreground">
            Practice tests
          </Link>
          {cert ? (
            <>
              {" "}
              /{" "}
              <Link href={examPath(cert.providerSlug, cert.slug) as Route} className="hover:text-foreground">
                {cert.code}
              </Link>
            </>
          ) : null}
        </p>
        <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">{test.title}</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">{test.description}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Badge variant="secondary">{test.questionCount} questions</Badge>
          <Badge variant="secondary">{test.timeLimitMin} minutes</Badge>
          <Badge variant="outline">Pass mark {test.passingScore}%</Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Purchase access</CardTitle>
          <CardDescription>
            One-time INR payment unlocks the online exam, retakes, and explanation review.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-3xl font-semibold">{formatInrFromPaise(test.pricePaise)}</p>
          <Button
            nativeButton={false}
            render={<Link href={`/checkout/${test.slug}`} />}
            className="w-full"
          >
            Continue to checkout
          </Button>
          <p className="text-xs text-muted-foreground">
            {paymentsReady
              ? "Razorpay keys are present. Order creation will be wired in the payments slice."
              : "Razorpay keys are not set yet. Checkout is a foundation screen until keys are added."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
