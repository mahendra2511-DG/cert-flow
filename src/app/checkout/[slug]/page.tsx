import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckoutPayButton } from "@/components/payments/checkout-pay-button";
import { userOwnsPracticeTest } from "@/lib/commerce/checkout";
import { findPracticeTestBySlug } from "@/lib/catalog/seed-catalog";
import { canAcceptPayments, isRazorpayTestMode, usesHostedRazorpay } from "@/lib/payments/razorpay";
import { createMetadata } from "@/lib/seo";
import { formatInrFromPaise } from "@/lib/utils";
import { route } from "@/lib/routes";

export const metadata = createMetadata({
  title: "Checkout",
  description: "Pay for a practice test with Razorpay.",
  path: "/checkout",
  noIndex: true,
});

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await auth();
  const { slug } = await params;
  const catalog = findPracticeTestBySlug(slug);
  if (!catalog) {
    notFound();
  }

  if (!session?.user?.id) {
    redirect(route(`/sign-in?callbackUrl=/checkout/${slug}`));
  }

  if (await userOwnsPracticeTest(session.user.id, slug)) {
    redirect(
      route(`/practice-test/${catalog.vendorSlug}/${catalog.exam.slug}/start?already=1`),
    );
  }

  const hosted = usesHostedRazorpay();
  const ready = canAcceptPayments();

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-12 sm:px-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{catalog.exam.code}</Badge>
            {hosted ? (
              <Badge variant={isRazorpayTestMode() ? "secondary" : "default"}>
                {isRazorpayTestMode() ? "Razorpay test mode" : "Razorpay live"}
              </Badge>
            ) : (
              <Badge variant="secondary">Local test checkout</Badge>
            )}
          </div>
          <CardTitle className="mt-2">Checkout</CardTitle>
          <CardDescription>
            Pay once in INR. The test unlocks only after the server verifies the Razorpay signature.
            Duplicate purchases are blocked.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="font-medium">{catalog.test.title}</p>
            <p className="text-sm text-muted-foreground">{catalog.exam.name}</p>
            <p className="mt-2 text-2xl font-semibold">{formatInrFromPaise(catalog.test.pricePaise)}</p>
          </div>
          {ready ? (
            <CheckoutPayButton
              practiceTestSlug={slug}
              title={catalog.test.title}
              pricePaise={catalog.test.pricePaise}
              hostedCheckout={hosted}
            />
          ) : (
            <p className="rounded-xl border bg-muted/40 px-3 py-3 text-sm">
              Set <code>RAZORPAY_KEY_ID</code> and <code>RAZORPAY_KEY_SECRET</code> on the server
              (Razorpay test keys first). Secrets are never sent to the browser.
            </p>
          )}
          <Button
            nativeButton={false}
            render={
              <Link
                href={route(`/practice-test/${catalog.vendorSlug}/${catalog.exam.slug}`)}
              />
            }
            variant="outline"
            className="w-full"
          >
            Back to test details
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
