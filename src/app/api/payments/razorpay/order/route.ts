import { NextResponse } from "next/server";
import { hasRazorpay } from "@/lib/env";

export async function POST() {
  if (!hasRazorpay()) {
    return NextResponse.json(
      {
        error: "Razorpay is not configured",
        hint: "Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to enable order creation.",
      },
      { status: 501 },
    );
  }

  return NextResponse.json({
    ok: true,
    message: "Razorpay order creation is scaffolded and will be implemented in the payments slice.",
  });
}
