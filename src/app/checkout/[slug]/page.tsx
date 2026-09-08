import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { practiceTestBySlug } from "@/lib/catalog/data";
import { hasRazorpay } from "@/lib/env";
import { createMetadata } from "@/lib/seo";
import { formatInrFromPaise } from "@/lib/utils";

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
  const { slug } = await params;
  const test = practiceTestBySlug(slug);
  if (!test) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-12 sm:px-6">
      <Card>
        <CardHeader>
          <CardTitle>Checkout</CardTitle>
          <CardDescription>
            Foundation screen for Razorpay. Order creation and signature verification land in a
            later slice.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="font-medium">{test.title}</p>
            <p className="text-2xl font-semibold">{formatInrFromPaise(test.pricePaise)}</p>
          </div>
          <Button type="button" className="w-full" disabled>
            {hasRazorpay() ? "Pay with Razorpay (coming next)" : "Add Razorpay keys to enable pay"}
          </Button>
          <Button
            nativeButton={false}
            render={<Link href={`/practice-tests/${test.slug}`} />}
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
