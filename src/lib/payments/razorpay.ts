import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
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

/** Public key id only. Never return RAZORPAY_KEY_SECRET from this function. */
export function razorpayPublicKey() {
  if (!hasRazorpay()) {
    return null;
  }
  return env.RAZORPAY_KEY_ID!;
}

export function isRazorpayTestMode() {
  const key = razorpayPublicKey();
  return Boolean(key?.startsWith("rzp_test_"));
}

/** Hosted Checkout when keys exist; local test checkout in non-production without keys. */
export function canAcceptPayments() {
  return hasRazorpay() || env.NODE_ENV !== "production";
}

export function usesHostedRazorpay() {
  return hasRazorpay();
}

function simulationSecret() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Simulated payments cannot run in production.");
  }
  return env.AUTH_SECRET ?? "prepharbor-dev-secret-change-me";
}

export type RazorpayOrderResult = {
  id: string;
  amount: number;
  currency: string;
  receipt?: string;
  status?: string;
};

export type CreateOrderInput = {
  amountPaise: number;
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
};

export async function createRazorpayOrder(input: CreateOrderInput): Promise<RazorpayOrderResult> {
  const razorpay = getRazorpayClient();
  if (!razorpay) {
    if (env.NODE_ENV === "production") {
      throw new Error("Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.");
    }
    return {
      id: `order_sim_${randomBytes(10).toString("hex")}`,
      amount: input.amountPaise,
      currency: input.currency ?? "INR",
      receipt: input.receipt,
      status: "created",
    };
  }

  const order = await razorpay.orders.create({
    amount: input.amountPaise,
    currency: input.currency ?? "INR",
    receipt: input.receipt,
    notes: input.notes,
  });

  return {
    id: String(order.id),
    amount: Number(order.amount),
    currency: String(order.currency),
    receipt: order.receipt ? String(order.receipt) : input.receipt,
    status: order.status ? String(order.status) : "created",
  };
}

export function expectedPaymentSignature(orderId: string, paymentId: string) {
  const secret = hasRazorpay() ? env.RAZORPAY_KEY_SECRET! : simulationSecret();
  return createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
}

export function verifyPaymentSignature(orderId: string, paymentId: string, signature: string) {
  const expected = expectedPaymentSignature(orderId, paymentId);
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length) {
    return false;
  }
  return timingSafeEqual(a, b);
}

export function verifyWebhookSignature(rawBody: string, signature: string) {
  const secret = env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    return false;
  }
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length) {
    return false;
  }
  return timingSafeEqual(a, b);
}

export function createSimulatedPayment(orderId: string) {
  const paymentId = `pay_sim_${randomBytes(10).toString("hex")}`;
  return {
    paymentId,
    signature: expectedPaymentSignature(orderId, paymentId),
  };
}
