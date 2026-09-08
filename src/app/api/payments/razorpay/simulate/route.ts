import { z } from "zod";
import { auth } from "@/auth";
import { env } from "@/lib/env";
import { jsonError, jsonOk, readJsonBody } from "@/lib/http";
import { createSimulatedPayment, usesHostedRazorpay } from "@/lib/payments/razorpay";
import { fulfillPaidOrder } from "@/lib/commerce/checkout";

const bodySchema = z.object({
  razorpay_order_id: z.string().min(1),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return jsonError("Sign in required.", 401);
  }
  if (env.NODE_ENV === "production" || usesHostedRazorpay()) {
    return jsonError("Simulated checkout is disabled.", 403);
  }

  const body = await readJsonBody(request);
  if (!body.ok) {
    return body.response;
  }
  const parsed = bodySchema.safeParse(body.value);
  if (!parsed.success) {
    return jsonError("razorpay_order_id is required.", 400);
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
      return jsonError("This order belongs to another account.", 403);
    }
    return jsonError("Order not found.", 404);
  }

  const item = result.order.items[0];
  const redirectTo = item
    ? `/practice-test/${item.vendorSlug}/${item.examSlug}/start?purchased=1`
    : "/dashboard/tests";

  return jsonOk({
    orderId: result.order.id,
    status: result.order.status,
    redirectTo,
  });
}
