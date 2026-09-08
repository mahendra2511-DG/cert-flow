import Razorpay from "razorpay";
import { env, hasRazorpay } from "@/lib/env";

let client: Razorpay | null | undefined;

export function getRazorpayClient() {
  if (!hasRazorpay()) {
    return null;
  }

  if (client === undefined) {
    client = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID!,
      key_secret: env.RAZORPAY_KEY_SECRET!,
    });
  }

  return client;
}

export function razorpayPublicKey() {
  return env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? env.RAZORPAY_KEY_ID ?? null;
}

export type CreateOrderInput = {
  amountPaise: number;
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
};

export async function createRazorpayOrder(input: CreateOrderInput) {
  const razorpay = getRazorpayClient();
  if (!razorpay) {
    throw new Error(
      "Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
    );
  }

  return razorpay.orders.create({
    amount: input.amountPaise,
    currency: input.currency ?? "INR",
    receipt: input.receipt,
    notes: input.notes,
  });
}
