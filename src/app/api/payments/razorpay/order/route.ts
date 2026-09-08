import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { createCheckoutOrder } from "@/lib/commerce/checkout";
import { canAcceptPayments, razorpayPublicKey, usesHostedRazorpay } from "@/lib/payments/razorpay";

const bodySchema = z.object({
  practiceTestSlug: z.string().min(1),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to purchase a practice test." }, { status: 401 });
  }
  if (!canAcceptPayments()) {
    return NextResponse.json(
      {
        error: "Payments are not configured.",
        hint: "Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET (Razorpay test keys) on the server.",
      },
      { status: 503 },
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "practiceTestSlug is required." }, { status: 400 });
  }

  try {
    const result = await createCheckoutOrder(session.user.id, parsed.data.practiceTestSlug);
    if (result.error === "TEST_NOT_FOUND") {
      return NextResponse.json({ error: "That practice test is not in the catalog." }, { status: 404 });
    }
    if (result.error === "ALREADY_OWNED") {
      return NextResponse.json(
        {
          error: "ALREADY_OWNED",
          owned: true,
          redirectTo: `/practice-test/${result.vendorSlug}/${result.examSlug}/start`,
        },
        { status: 409 },
      );
    }

    const order = result.order;
    const item = order.items[0];
    return NextResponse.json({
      orderId: order.id,
      razorpayOrderId: order.razorpayOrderId,
      amountPaise: order.amountPaise,
      currency: order.currency,
      keyId: razorpayPublicKey(),
      hostedCheckout: usesHostedRazorpay(),
      reused: result.reused,
      test: {
        slug: item?.practiceTestId,
        title: item?.testName,
        examCode: item?.examCode,
        vendorSlug: item?.vendorSlug,
        examSlug: item?.examSlug,
      },
      prefill: {
        name: session.user.name ?? "",
        email: session.user.email ?? "",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create a Razorpay order.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
