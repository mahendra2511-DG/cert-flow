export type PaymentStatus = "PAID" | "PENDING" | "FAILED";

export type OrderItem = {
  practiceTestId: string;
  testName: string;
  examCode: string;
  vendorSlug: string;
  examSlug: string;
  amountPaise: number;
};

export type StoredOrder = {
  id: string;
  userId: string;
  items: OrderItem[];
  amountPaise: number;
  currency: "INR";
  status: PaymentStatus;
  createdAt: string;
  invoiceNumber: string;
  paymentMethod: string;
  receiptNote: string;
};

export type StoredPurchase = {
  id: string;
  orderId: string;
  userId: string;
  practiceTestId: string;
  testName: string;
  examCode: string;
  vendorSlug: string;
  examSlug: string;
  amountPaise: number;
  purchasedAt: string;
};
