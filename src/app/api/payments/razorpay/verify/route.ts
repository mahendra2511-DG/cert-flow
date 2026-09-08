import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { fulfillPaidOrder } from "@/lib/commerce/checkout";
import { verifyPaymentSignature } from "@/lib/payments/razorpay";

const bodySchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Missing Razorpay payment fields." }, { status: 400 });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;
  const valid = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
  if (!valid) {
    return NextResponse.json({ error: "Payment signature did not match." }, { status: 400 });
  }

  const result = await fulfillPaidOrder({
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    razorpaySignature: razorpay_signature,
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
    alreadyPaid: result.alreadyPaid,
    orderId: result.order.id,
    status: result.order.status,
    redirectTo,
  });
}
