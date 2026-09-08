import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/db";
import { findUserById } from "@/lib/auth/user-store";
import { findExamContext } from "@/lib/exam/engine";
import { findPracticeTestBySlug } from "@/lib/catalog/seed-catalog";
import {
  findPendingOrder,
  getOrderByRazorpayId,
  hasPaidPurchase,
  saveStoredOrder,
} from "@/lib/commerce/order-store";
import type { PaymentStatus, StoredOrder } from "@/lib/commerce/types";
import { createRazorpayOrder } from "@/lib/payments/razorpay";

function invoiceNumber() {
  const year = new Date().getUTCFullYear();
  const suffix = randomBytes(3).toString("hex").toUpperCase();
  return `INV-${year}-${suffix}`;
}

function receiptCode() {
  return `ph_${randomBytes(6).toString("hex")}`.slice(0, 40);
}

async function ensurePrismaUser(userId: string) {
  if (!prisma) {
    return;
  }
  const local = await findUserById(userId);
  await prisma.user.upsert({
    where: { id: userId },
    create: {
      id: userId,
      email: local?.email ?? `${userId}@prepharbor.test`,
      name: local?.name ?? "Learner",
    },
    update: {
      email: local?.email ?? undefined,
      name: local?.name ?? undefined,
    },
  });
}

function toStored(input: {
  id: string;
  userId: string;
  practiceTestSlug: string;
  vendorSlug: string;
  examSlug: string;
  examCode: string;
  testName: string;
  amountPaise: number;
  status: PaymentStatus;
  razorpayOrderId: string;
  razorpayPaymentId?: string | null;
  invoiceNumber: string;
  paymentMethod?: string | null;
  failureReason?: string | null;
  createdAt: Date | string;
}): StoredOrder {
  const createdAt = typeof input.createdAt === "string" ? input.createdAt : input.createdAt.toISOString();
  const status = input.status;
  return {
    id: input.id,
    userId: input.userId,
    items: [
      {
        practiceTestId: input.practiceTestSlug,
        testName: input.testName,
        examCode: input.examCode,
        vendorSlug: input.vendorSlug,
        examSlug: input.examSlug,
        amountPaise: input.amountPaise,
      },
    ],
    amountPaise: input.amountPaise,
    currency: "INR",
    status,
    createdAt,
    invoiceNumber: input.invoiceNumber,
    paymentMethod: input.paymentMethod ?? "Razorpay",
    receiptNote:
      status === "PAID"
        ? "Paid in full. Access is unlocked for this practice test, including retakes."
        : status === "CANCELLED"
          ? "Checkout was closed before payment completed."
          : status === "FAILED"
            ? (input.failureReason ?? "Payment failed.")
            : "Waiting for Razorpay confirmation.",
    razorpayOrderId: input.razorpayOrderId,
    razorpayPaymentId: input.razorpayPaymentId ?? undefined,
    failureReason: input.failureReason ?? undefined,
  };
}

export async function userOwnsPracticeTest(userId: string, practiceTestSlug: string) {
  if (prisma) {
    try {
      const paid = await prisma.purchase.findFirst({
        where: { userId, practiceTestSlug, status: "PAID" },
      });
      if (paid) {
        return true;
      }
    } catch {
      // fall through to file store
    }
  }
  return hasPaidPurchase(userId, practiceTestSlug);
}

export async function userOwnsExam(userId: string, vendorSlug: string, examSlug: string) {
  const examMatch = findExamContext(vendorSlug, examSlug);
  if (!examMatch) {
    return false;
  }
  return userOwnsPracticeTest(userId, examMatch.test.slug);
}

export async function createCheckoutOrder(userId: string, practiceTestSlug: string) {
  const catalog = findPracticeTestBySlug(practiceTestSlug);
  if (!catalog) {
    return { error: "TEST_NOT_FOUND" as const };
  }

  if (await userOwnsPracticeTest(userId, practiceTestSlug)) {
    return {
      error: "ALREADY_OWNED" as const,
      vendorSlug: catalog.vendorSlug,
      examSlug: catalog.exam.slug,
    };
  }

  const pending = await findPendingOrder(userId, practiceTestSlug);
  if (pending?.razorpayOrderId) {
    return { order: pending, reused: true as const, catalog };
  }

  const receipt = receiptCode();
  const razorpayOrder = await createRazorpayOrder({
    amountPaise: catalog.test.pricePaise,
    currency: "INR",
    receipt,
    notes: {
      userId,
      practiceTestSlug,
      vendorSlug: catalog.vendorSlug,
      examSlug: catalog.exam.slug,
    },
  });

  const id = `ord_${randomBytes(8).toString("hex")}`;
  const invoice = invoiceNumber();
  const createdAt = new Date();

  await ensurePrismaUser(userId);

  if (prisma) {
    try {
      await prisma.paymentOrder.create({
        data: {
          id,
          userId,
          practiceTestSlug,
          vendorSlug: catalog.vendorSlug,
          examSlug: catalog.exam.slug,
          examCode: catalog.exam.code,
          testName: catalog.test.title,
          amountPaise: catalog.test.pricePaise,
          currency: "INR",
          status: "PENDING",
          razorpayOrderId: razorpayOrder.id,
          invoiceNumber: invoice,
          receipt,
          paymentMethod: "Razorpay",
        },
      });
    } catch {
      // File store still records the order.
    }
  }

  const stored = toStored({
    id,
    userId,
    practiceTestSlug,
    vendorSlug: catalog.vendorSlug,
    examSlug: catalog.exam.slug,
    examCode: catalog.exam.code,
    testName: catalog.test.title,
    amountPaise: catalog.test.pricePaise,
    status: "PENDING",
    razorpayOrderId: razorpayOrder.id,
    invoiceNumber: invoice,
    paymentMethod: "Razorpay (pending)",
    createdAt,
  });
  await saveStoredOrder(stored);
  return { order: stored, reused: false as const, catalog };
}

async function persistStatus(
  order: StoredOrder,
  next: {
    status: PaymentStatus;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    paymentMethod?: string;
    failureReason?: string;
  },
) {
  const item = order.items[0];
  const updated: StoredOrder = {
    ...order,
    status: next.status,
    razorpayPaymentId: next.razorpayPaymentId ?? order.razorpayPaymentId,
    paymentMethod: next.paymentMethod ?? order.paymentMethod,
    failureReason: next.failureReason,
    receiptNote:
      next.status === "PAID"
        ? "Paid in full. Access is unlocked for this practice test, including retakes."
        : next.status === "CANCELLED"
          ? "Checkout was closed before payment completed."
          : next.status === "FAILED"
            ? (next.failureReason ?? "Payment failed.")
            : order.receiptNote,
  };
  await saveStoredOrder(updated);

  if (prisma) {
    try {
      await prisma.paymentOrder.update({
        where: { id: order.id },
        data: {
          status: next.status,
          razorpayPaymentId: next.razorpayPaymentId,
          razorpaySignature: next.razorpaySignature,
          paymentMethod: next.paymentMethod ?? order.paymentMethod,
          failureReason: next.failureReason,
        },
      });
      if (next.status === "PAID" && item) {
        await prisma.purchase.upsert({
          where: {
            userId_practiceTestSlug: {
              userId: order.userId,
              practiceTestSlug: item.practiceTestId,
            },
          },
          create: {
            userId: order.userId,
            paymentOrderId: order.id,
            practiceTestSlug: item.practiceTestId,
            vendorSlug: item.vendorSlug,
            examSlug: item.examSlug,
            examCode: item.examCode,
            testName: item.testName,
            amountPaise: item.amountPaise,
            currency: "INR",
            status: "PAID",
          },
          update: {
            paymentOrderId: order.id,
            status: "PAID",
            amountPaise: item.amountPaise,
          },
        });
      }
    } catch {
      // File store is the unlock source when Postgres is unavailable.
    }
  }

  return updated;
}

export async function fulfillPaidOrder(input: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  userId?: string;
}): Promise<
  | { error: "ORDER_NOT_FOUND" | "FORBIDDEN" }
  | { order: StoredOrder; alreadyPaid: boolean }
> {
  const order = await getOrderByRazorpayId(input.razorpayOrderId);
  if (!order) {
    return { error: "ORDER_NOT_FOUND" as const };
  }
  if (input.userId && order.userId !== input.userId) {
    return { error: "FORBIDDEN" as const };
  }
  if (order.status === "PAID") {
    return { order, alreadyPaid: true as const };
  }

  const updated = await persistStatus(order, {
    status: "PAID",
    razorpayPaymentId: input.razorpayPaymentId,
    razorpaySignature: input.razorpaySignature,
    paymentMethod: "Razorpay",
  });
  return { order: updated, alreadyPaid: false as const };
}

export async function markOrderFailed(razorpayOrderId: string, userId: string, reason: string) {
  const order = await getOrderByRazorpayId(razorpayOrderId);
  if (!order || order.userId !== userId) {
    return { error: "ORDER_NOT_FOUND" as const };
  }
  if (order.status === "PAID") {
    return { order };
  }
  const updated = await persistStatus(order, { status: "FAILED", failureReason: reason });
  return { order: updated };
}

export async function markOrderCancelled(razorpayOrderId: string, userId: string) {
  const order = await getOrderByRazorpayId(razorpayOrderId);
  if (!order || order.userId !== userId) {
    return { error: "ORDER_NOT_FOUND" as const };
  }
  if (order.status === "PAID") {
    return { order };
  }
  const updated = await persistStatus(order, { status: "CANCELLED", failureReason: "Checkout dismissed" });
  return { order: updated };
}
