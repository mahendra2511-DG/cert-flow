import { env } from "@/lib/env";
import { fulfillPaidOrder } from "@/lib/commerce/checkout";
import { jsonError, jsonOk } from "@/lib/http";
import { verifyWebhookSignature } from "@/lib/payments/razorpay";

export async function POST(request: Request) {
  const raw = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";
  if (!env.RAZORPAY_WEBHOOK_SECRET) {
    return jsonError("Webhook secret is not configured.", 503);
  }
  if (!verifyWebhookSignature(raw, signature)) {
    return jsonError("Invalid webhook signature.", 400);
  }

  let payload: {
    event?: string;
    payload?: {
      payment?: {
        entity?: {
          id?: string;
          order_id?: string;
        };
      };
    };
  };
  try {
    payload = JSON.parse(raw) as typeof payload;
  } catch {
    return jsonError("Invalid JSON.", 400);
  }

  if (payload.event !== "payment.captured") {
    return jsonOk({ ignored: true });
  }

  const paymentId = payload.payload?.payment?.entity?.id;
  const orderId = payload.payload?.payment?.entity?.order_id;
  if (!paymentId || !orderId) {
    return jsonError("Missing payment entity.", 400);
  }

  const result = await fulfillPaidOrder({
    razorpayOrderId: orderId,
    razorpayPaymentId: paymentId,
    razorpaySignature: signature,
  });

  if ("error" in result) {
    return jsonError("Order not found.", 404);
  }

  return jsonOk({ status: result.order.status });
}
