import { z } from "zod";
import { auth } from "@/auth";
import { fulfillPaidOrder } from "@/lib/commerce/checkout";
import { jsonError, jsonOk, parseJson } from "@/lib/http";
import { verifyPaymentSignature } from "@/lib/payments/razorpay";

const bodySchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return jsonError("Sign in required.", 401);
  }

  const parsed = await parseJson(request, bodySchema, "Missing Razorpay payment fields.");
  if (!parsed.ok) {
    return parsed.response;
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.value;
  const valid = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
  if (!valid) {
    return jsonError("Payment signature did not match.", 400);
  }

  const result = await fulfillPaidOrder({
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    razorpaySignature: razorpay_signature,
    userId: session.user.id,
  });

  if ("error" in result) {
    if (result.error === "FORBIDDEN") {
      return jsonError("This order belongs to another account.", 403);
    }
    return jsonError("Order not found.", 404);
  }

  const item = result.order.items[0];
  const redirectTo = item
    ? `/practice-test/${item.vendorSlug}/${item.examSlug}/start?purchased=1`
    : "/dashboard/tests";

  return jsonOk({
    alreadyPaid: result.alreadyPaid,
    orderId: result.order.id,
    status: result.order.status,
    redirectTo,
  });
}
