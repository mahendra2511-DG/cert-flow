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
import { findLivePracticeTest, vendorIsPublic } from "@/lib/admin/catalog-store";
import { examPath } from "@/lib/catalog/seed-catalog";
import { createMetadata } from "@/lib/seo";
import { formatInrFromPaise } from "@/lib/utils";
import type { Route } from "next";
import { auth } from "@/auth";
import { userOwnsPracticeTest } from "@/lib/commerce/checkout";

function publicTest(slug: string) {
  const catalog = findLivePracticeTest(slug);
  if (
    !catalog ||
    !catalog.exam.isPublished ||
    !catalog.test.isPublished ||
    !vendorIsPublic(catalog.vendorSlug)
  ) {
    return null;
  }
  return catalog;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const catalog = publicTest(slug);
  if (!catalog) {
    return createMetadata({
      title: "Practice test not found",
      description: "That practice test is not in the catalog.",
      path: `/practice-tests/${slug}`,
      noIndex: true,
    });
  }

  return createMetadata({
    title: catalog.test.title,
    description: catalog.test.summary,
    path: `/practice-tests/${catalog.test.slug}`,
  });
}

export default async function PracticeTestDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const catalog = publicTest(slug);
  if (!catalog) {
    notFound();
  }

  const { test, exam, vendorSlug } = catalog;
  const session = await auth();
  const owned = session?.user?.id ? await userOwnsPracticeTest(session.user.id, test.slug) : false;

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div>
        <p className="text-sm text-muted-foreground">
          <Link href="/practice-tests" className="hover:text-foreground">
            Practice tests
          </Link>{" "}
          /{" "}
          <Link href={examPath(vendorSlug, exam.slug) as Route} className="hover:text-foreground">
            {exam.code}
          </Link>
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
          {owned ? (
            <Button
              nativeButton={false}
              render={<Link href={`/practice-test/${vendorSlug}/${exam.slug}/start` as Route} />}
              className="w-full"
            >
              Start practice test
            </Button>
          ) : (
            <Button
              nativeButton={false}
              render={<Link href={`/checkout/${test.slug}`} />}
              className="w-full"
            >
              Continue to checkout
            </Button>
          )}
          <p className="text-xs text-muted-foreground">
            {owned
              ? "This account already has verified access."
              : "Razorpay Checkout runs in the browser with only the public key id. The secret key stays on the server."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
