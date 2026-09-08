import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { createSimulatedPayment, usesHostedRazorpay } from "@/lib/payments/razorpay";
import { fulfillPaidOrder } from "@/lib/commerce/checkout";

const bodySchema = z.object({
  razorpay_order_id: z.string().min(1),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  if (usesHostedRazorpay()) {
    return NextResponse.json(
      { error: "Simulated checkout is disabled while Razorpay keys are configured." },
      { status: 400 },
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
    return NextResponse.json({ error: "razorpay_order_id is required." }, { status: 400 });
  }

  const simulated = createSimulatedPayment(parsed.data.razorpay_order_id);
  const result = await fulfillPaidOrder({
    razorpayOrderId: parsed.data.razorpay_order_id,
    razorpayPaymentId: simulated.paymentId,
    razorpaySignature: simulated.signature,
    userId: session.user.id,
  });

  if ("error" in result) {
    if (result.error === "FORBIDDEN") {
      return NextResponse.json({ error: "This order belongs to another account." }, { status: 403 });
    }
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const item = result.order.items[0];
  const redirectTo = item
    ? `/practice-test/${item.vendorSlug}/${item.examSlug}/start?purchased=1`
    : "/dashboard/tests";

  return NextResponse.json({
    ok: true,
    orderId: result.order.id,
    status: result.order.status,
    redirectTo,
  });
}
