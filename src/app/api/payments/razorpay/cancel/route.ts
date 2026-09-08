import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { markOrderCancelled } from "@/lib/commerce/checkout";

const bodySchema = z.object({
  razorpay_order_id: z.string().min(1),
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
    return NextResponse.json({ error: "razorpay_order_id is required." }, { status: 400 });
  }

  const result = await markOrderCancelled(parsed.data.razorpay_order_id, session.user.id);
  if (result.error) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true, status: result.order.status, orderId: result.order.id });
}
