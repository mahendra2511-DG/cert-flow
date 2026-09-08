-- Payment orders and purchases without a PracticeTest foreign key.
-- Applied with: npx prisma migrate dev   or   npx prisma db push

-- AlterEnum
ALTER TYPE "PurchaseStatus" ADD VALUE IF NOT EXISTS 'CANCELLED';

-- Drop FK from old Purchase.practiceTestId if present (best-effort for fresh DBs).
-- Fresh installs use the models below.

CREATE TABLE IF NOT EXISTS "PaymentOrder" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "practiceTestSlug" TEXT NOT NULL,
    "vendorSlug" TEXT NOT NULL,
    "examSlug" TEXT NOT NULL,
    "examCode" TEXT NOT NULL,
    "testName" TEXT NOT NULL,
    "amountPaise" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" "PurchaseStatus" NOT NULL DEFAULT 'PENDING',
    "razorpayOrderId" TEXT NOT NULL,
    "razorpayPaymentId" TEXT,
    "razorpaySignature" TEXT,
    "invoiceNumber" TEXT NOT NULL,
    "receipt" TEXT NOT NULL,
    "paymentMethod" TEXT,
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentOrder_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PaymentOrder_razorpayOrderId_key" ON "PaymentOrder"("razorpayOrderId");
CREATE INDEX IF NOT EXISTS "PaymentOrder_userId_status_idx" ON "PaymentOrder"("userId", "status");
CREATE INDEX IF NOT EXISTS "PaymentOrder_userId_practiceTestSlug_idx" ON "PaymentOrder"("userId", "practiceTestSlug");

ALTER TABLE "PaymentOrder" DROP CONSTRAINT IF EXISTS "PaymentOrder_userId_fkey";
ALTER TABLE "PaymentOrder" ADD CONSTRAINT "PaymentOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
