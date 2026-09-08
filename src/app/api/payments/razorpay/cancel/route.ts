import { z } from "zod";
import { auth } from "@/auth";
import { markOrderCancelled } from "@/lib/commerce/checkout";
import { jsonError, jsonOk, parseJson } from "@/lib/http";

const bodySchema = z.object({
  razorpay_order_id: z.string().min(1),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return jsonError("Sign in required.", 401);
  }

  const parsed = await parseJson(request, bodySchema, "razorpay_order_id is required.");
  if (!parsed.ok) {
    return parsed.response;
  }

  const result = await markOrderCancelled(parsed.value.razorpay_order_id, session.user.id);
  if (result.error) {
    return jsonError("Order not found.", 404);
  }
  return jsonOk({ status: result.order.status, orderId: result.order.id });
}
