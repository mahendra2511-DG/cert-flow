import { z } from "zod";
import { auth } from "@/auth";
import { createCheckoutOrder } from "@/lib/commerce/checkout";
import { jsonError, jsonOk, parseJson } from "@/lib/http";
import { canAcceptPayments, razorpayPublicKey, usesHostedRazorpay } from "@/lib/payments/razorpay";

const bodySchema = z.object({
  practiceTestSlug: z.string().min(1),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return jsonError("Sign in to purchase a practice test.", 401);
  }
  if (!canAcceptPayments()) {
    return jsonError("Payments are not configured.", 503, {
      hint: "Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET (Razorpay test keys) on the server.",
    });
  }

  const parsed = await parseJson(request, bodySchema, "practiceTestSlug is required.");
  if (!parsed.ok) {
    return parsed.response;
  }

  try {
    const result = await createCheckoutOrder(session.user.id, parsed.value.practiceTestSlug);
    if (result.error === "TEST_NOT_FOUND") {
      return jsonError("That practice test is not in the catalog.", 404);
    }
    if (result.error === "ALREADY_OWNED") {
      return jsonError("You already own this practice test.", 409, {
        owned: true,
        redirectTo: `/practice-test/${result.vendorSlug}/${result.examSlug}/start`,
      });
    }

    const order = result.order;
    const item = order.items[0];
    return jsonOk({
      orderId: order.id,
      razorpayOrderId: order.razorpayOrderId,
      amountPaise: order.amountPaise,
      currency: order.currency,
      keyId: razorpayPublicKey(),
      hostedCheckout: usesHostedRazorpay(),
      reused: result.reused,
      test: {
        slug: item?.practiceTestId,
        title: item?.testName,
        examCode: item?.examCode,
        vendorSlug: item?.vendorSlug,
        examSlug: item?.examSlug,
      },
      prefill: {
        name: session.user.name ?? "",
        email: session.user.email ?? "",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create a Razorpay order.";
    return jsonError(message, 502);
  }
}
