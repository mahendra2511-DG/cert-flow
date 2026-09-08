import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { DEMO_USER_ID } from "@/lib/auth/types";
import { prisma } from "@/lib/db";
import type { PaymentStatus, StoredOrder, StoredPurchase } from "@/lib/commerce/types";

const FILE = path.join("/tmp", "prepharbor-orders.json");

type OrderFile = { orders: StoredOrder[] };

const memory = globalThis as unknown as {
  __prepharborOrders?: Map<string, StoredOrder>;
  __prepharborOrdersReady?: Promise<void>;
};

function mem() {
  if (!memory.__prepharborOrders) {
    memory.__prepharborOrders = new Map();
  }
  return memory.__prepharborOrders;
}

async function readFileStore(): Promise<StoredOrder[]> {
  try {
    const raw = await readFile(FILE, "utf8");
    const parsed = JSON.parse(raw) as OrderFile;
    return parsed.orders ?? [];
  } catch {
    return [];
  }
}

async function writeFileStore() {
  await mkdir(path.dirname(FILE), { recursive: true });
  await writeFile(FILE, JSON.stringify({ orders: [...mem().values()] }, null, 2), "utf8");
}

function demoOrders(): StoredOrder[] {
  return [
    {
      id: "ord_ph_8f2a1c",
      userId: DEMO_USER_ID,
      items: [
        {
          practiceTestId: "saa-c03-full-length",
          testName: "SAA-C03 Full-Length Practice Exam",
          examCode: "SAA-C03",
          vendorSlug: "aws",
          examSlug: "saa-c03",
          amountPaise: 149900,
        },
      ],
      amountPaise: 149900,
      currency: "INR",
      status: "PAID",
      createdAt: "2026-07-18T11:24:00.000Z",
      invoiceNumber: "INV-2026-1042",
      paymentMethod: "Razorpay · UPI",
      receiptNote: "Paid in full. Access is unlimited for this practice test, including retakes.",
      razorpayOrderId: "order_demo_saa",
    },
    {
      id: "ord_ph_3c91de",
      userId: DEMO_USER_ID,
      items: [
        {
          practiceTestId: "az-900-core-drill",
          testName: "AZ-900 Core Concepts Drill",
          examCode: "AZ-900",
          vendorSlug: "microsoft",
          examSlug: "az-900",
          amountPaise: 79900,
        },
      ],
      amountPaise: 79900,
      currency: "INR",
      status: "PAID",
      createdAt: "2026-08-02T08:05:00.000Z",
      invoiceNumber: "INV-2026-1108",
      paymentMethod: "Razorpay · Visa •••• 4242",
      receiptNote: "Paid in full. GST invoice available from this receipt page.",
      razorpayOrderId: "order_demo_az",
    },
    {
      id: "ord_ph_71bb04",
      userId: DEMO_USER_ID,
      items: [
        {
          practiceTestId: "sy0-701-security-lab",
          testName: "SY0-701 Security Operations Lab",
          examCode: "SY0-701",
          vendorSlug: "comptia",
          examSlug: "sy0-701",
          amountPaise: 129900,
        },
      ],
      amountPaise: 129900,
      currency: "INR",
      status: "PAID",
      createdAt: "2026-08-21T16:40:00.000Z",
      invoiceNumber: "INV-2026-1187",
      paymentMethod: "Razorpay · Net banking",
      receiptNote: "Paid in full. Start from your dashboard whenever you are ready.",
      razorpayOrderId: "order_demo_sy0",
    },
  ];
}

function mapStatus(status: string): PaymentStatus {
  if (status === "PAID" || status === "REFUNDED") {
    return "PAID";
  }
  if (status === "FAILED") {
    return "FAILED";
  }
  if (status === "CANCELLED") {
    return "CANCELLED";
  }
  return "PENDING";
}

function fromPrisma(order: {
  id: string;
  userId: string;
  practiceTestSlug: string;
  vendorSlug: string;
  examSlug: string;
  examCode: string;
  testName: string;
  amountPaise: number;
  currency: string;
  status: string;
  razorpayOrderId: string;
  razorpayPaymentId: string | null;
  invoiceNumber: string;
  paymentMethod: string | null;
  failureReason: string | null;
  createdAt: Date;
}): StoredOrder {
  const status = mapStatus(order.status);
  return {
    id: order.id,
    userId: order.userId,
    items: [
      {
        practiceTestId: order.practiceTestSlug,
        testName: order.testName,
        examCode: order.examCode,
        vendorSlug: order.vendorSlug,
        examSlug: order.examSlug,
        amountPaise: order.amountPaise,
      },
    ],
    amountPaise: order.amountPaise,
    currency: "INR",
    status,
    createdAt: order.createdAt.toISOString(),
    invoiceNumber: order.invoiceNumber,
    paymentMethod: order.paymentMethod ?? "Razorpay",
    receiptNote:
      status === "PAID"
        ? "Paid in full. Access is unlocked for this practice test, including retakes."
        : status === "CANCELLED"
          ? "Checkout was closed before payment completed."
          : status === "FAILED"
            ? (order.failureReason ?? "Payment failed.")
            : "Waiting for Razorpay confirmation.",
    razorpayOrderId: order.razorpayOrderId,
    razorpayPaymentId: order.razorpayPaymentId ?? undefined,
    failureReason: order.failureReason ?? undefined,
  };
}

async function hydrate() {
  if (memory.__prepharborOrdersReady) {
    return memory.__prepharborOrdersReady;
  }
  memory.__prepharborOrdersReady = (async () => {
    const stored = await readFileStore();
    for (const order of stored) {
      mem().set(order.id, order);
    }
    if (![...mem().values()].some((order) => order.userId === DEMO_USER_ID)) {
      for (const order of demoOrders()) {
        mem().set(order.id, order);
      }
      await writeFileStore();
    }
    if (prisma) {
      try {
        const rows = await prisma.paymentOrder.findMany();
        for (const row of rows) {
          mem().set(row.id, fromPrisma(row));
        }
        await writeFileStore();
      } catch {
        // Schema may not be pushed yet.
      }
    }
  })();
  return memory.__prepharborOrdersReady;
}

export async function saveStoredOrder(order: StoredOrder) {
  await hydrate();
  mem().set(order.id, order);
  await writeFileStore();
}

export async function listOrdersForUser(userId: string) {
  await hydrate();
  return [...mem().values()]
    .filter((order) => order.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getOrderForUser(userId: string, orderId: string) {
  await hydrate();
  const order = mem().get(orderId);
  if (!order || order.userId !== userId) {
    return null;
  }
  return order;
}

export async function getOrderByRazorpayId(razorpayOrderId: string) {
  await hydrate();
  return [...mem().values()].find((order) => order.razorpayOrderId === razorpayOrderId) ?? null;
}

export async function listPurchasesForUser(userId: string): Promise<StoredPurchase[]> {
  const orders = await listOrdersForUser(userId);
  const purchases: StoredPurchase[] = [];
  for (const order of orders) {
    if (order.status !== "PAID") {
      continue;
    }
    for (const item of order.items) {
      purchases.push({
        id: `${order.id}_${item.practiceTestId}`,
        orderId: order.id,
        userId,
        practiceTestId: item.practiceTestId,
        testName: item.testName,
        examCode: item.examCode,
        vendorSlug: item.vendorSlug,
        examSlug: item.examSlug,
        amountPaise: item.amountPaise,
        purchasedAt: order.createdAt,
      });
    }
  }
  return purchases;
}

export async function hasPaidPurchase(userId: string, practiceTestSlug: string) {
  const purchases = await listPurchasesForUser(userId);
  return purchases.some((item) => item.practiceTestId === practiceTestSlug);
}

export async function findPendingOrder(userId: string, practiceTestSlug: string) {
  const orders = await listOrdersForUser(userId);
  return (
    orders.find(
      (order) =>
        order.status === "PENDING" &&
        order.items.some((item) => item.practiceTestId === practiceTestSlug),
    ) ?? null
  );
}
