"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatInrFromPaise } from "@/lib/utils";
import { toast } from "@/components/ui/toaster";
import { route } from "@/lib/routes";

type CheckoutPayload = {
  orderId: string;
  razorpayOrderId: string;
  amountPaise: number;
  currency: string;
  keyId: string | null;
  hostedCheckout: boolean;
  test: {
    slug: string;
    title: string;
    examCode: string;
    vendorSlug: string;
    examSlug: string;
  };
  prefill: { name: string; email: string };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayInstance;
  }
}

type RazorpayCheckoutOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: { name?: string; email?: string };
  handler: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
  modal?: { ondismiss?: () => void };
  theme?: { color?: string };
};

type RazorpayInstance = {
  open: () => void;
  on: (event: "payment.failed", handler: (response: { error?: { description?: string } }) => void) => void;
};

function loadCheckoutScript() {
  if (document.getElementById("razorpay-checkout-js")) {
    return Promise.resolve();
  }
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.id = "razorpay-checkout-js";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load Razorpay Checkout."));
    document.body.appendChild(script);
  });
}

export function CheckoutPayButton({
  practiceTestSlug,
  title,
  pricePaise,
  hostedCheckout,
}: {
  practiceTestSlug: string;
  title: string;
  pricePaise: number;
  hostedCheckout: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function createOrder() {
    const response = await fetch("/api/payments/razorpay/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ practiceTestSlug }),
    });
    const data = (await response.json()) as CheckoutPayload & {
      error?: string;
      owned?: boolean;
      redirectTo?: string;
    };
    if (response.status === 409 && data.redirectTo) {
      router.push(route(data.redirectTo));
      return null;
    }
    if (!response.ok) {
      throw new Error(data.error ?? "Could not create a Razorpay order.");
    }
    if (!data.razorpayOrderId) {
      throw new Error("The server did not return a Razorpay order id.");
    }
    return data;
  }

  async function verify(payload: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) {
    const response = await fetch("/api/payments/razorpay/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await response.json()) as { error?: string; redirectTo?: string };
    if (!response.ok) {
      throw new Error(data.error ?? "Payment verification failed.");
    }
    toast("Payment verified", { description: "The practice test is unlocked.", variant: "success" });
    router.push(route(data.redirectTo ?? "/dashboard/tests"));
    router.refresh();
  }

  async function payHosted() {
    setPending(true);
    setError(null);
    setMessage(null);
    try {
      const order = await createOrder();
      if (!order) {
        return;
      }
      if (!order.keyId) {
        throw new Error("Razorpay key id is missing on the server.");
      }
      await loadCheckoutScript();
      if (!window.Razorpay) {
        throw new Error("Razorpay Checkout did not load.");
      }
      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amountPaise,
        currency: order.currency,
        name: "PrepHarbor",
        description: `${order.test.examCode} · ${order.test.title}`,
        order_id: order.razorpayOrderId,
        prefill: order.prefill,
        theme: { color: "#0f766e" },
        handler: (response) => {
          void verify(response).catch((err: Error) => {
            setError(err.message);
            toast(err.message, { variant: "error" });
            setPending(false);
          });
        },
        modal: {
          ondismiss: () => {
            void fetch("/api/payments/razorpay/cancel", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ razorpay_order_id: order.razorpayOrderId }),
            });
            setPending(false);
            setMessage("Payment was cancelled. You have not been charged, and the test is still locked.");
            toast("Payment cancelled", { description: "The test is still locked.", variant: "info" });
          },
        },
      });
      checkout.on("payment.failed", (response) => {
        const reason = response.error?.description ?? "Payment failed";
        void fetch("/api/payments/razorpay/fail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ razorpay_order_id: order.razorpayOrderId, reason }),
        });
        setPending(false);
        setError(reason);
      });
      checkout.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed.");
      setPending(false);
    }
  }

  async function paySimulated() {
    setPending(true);
    setError(null);
    setMessage(null);
    try {
      const order = await createOrder();
      if (!order) {
        return;
      }
      const response = await fetch("/api/payments/razorpay/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ razorpay_order_id: order.razorpayOrderId }),
      });
      const data = (await response.json()) as { error?: string; redirectTo?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Simulated payment failed.");
      }
      toast("Payment verified", { description: "The practice test is unlocked.", variant: "success" });
      router.push(route(data.redirectTo ?? "/dashboard/tests"));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed.");
      setPending(false);
    }
  }

  return (
    <div className="space-y-3">
      <Button
        type="button"
        className="w-full"
        disabled={pending}
        onClick={() => void (hostedCheckout ? payHosted() : paySimulated())}
      >
        {pending
          ? "Working…"
          : hostedCheckout
            ? `Pay ${formatInrFromPaise(pricePaise)} with Razorpay`
            : `Pay ${formatInrFromPaise(pricePaise)} (local test checkout)`}
      </Button>
      {!hostedCheckout ? (
        <p className="text-xs text-muted-foreground">
          Razorpay test keys are not set. This button runs the same create → verify → unlock path on
          the server without exposing a secret. Add Razorpay test keys on the server to open hosted Checkout.
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          You will complete payment in Razorpay Checkout. The secret key never leaves the server.
          Access unlocks only after signature verification.
        </p>
      )}
      {!hostedCheckout ? (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={pending}
            onClick={() => {
              void (async () => {
                setPending(true);
                setError(null);
                try {
                  const order = await createOrder();
                  if (!order) return;
                  const response = await fetch("/api/payments/razorpay/fail", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      razorpay_order_id: order.razorpayOrderId,
                      reason: "Simulated decline",
                    }),
                  });
                  const data = (await response.json()) as { error?: string };
                  if (!response.ok) throw new Error(data.error ?? "Could not record failure.");
                  setError("Payment failed. The test stays locked. You can try checkout again.");
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Checkout failed.");
                } finally {
                  setPending(false);
                }
              })();
            }}
          >
            Simulate failed payment
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            disabled={pending}
            onClick={() => {
              void (async () => {
                setPending(true);
                setError(null);
                try {
                  const order = await createOrder();
                  if (!order) return;
                  await fetch("/api/payments/razorpay/cancel", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ razorpay_order_id: order.razorpayOrderId }),
                  });
                  setMessage("Payment was cancelled. You have not been charged, and the test is still locked.");
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Checkout failed.");
                } finally {
                  setPending(false);
                }
              })();
            }}
          >
            Simulate cancelled checkout
          </Button>
        </div>
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <p className="sr-only">{title}</p>
    </div>
  );
}
