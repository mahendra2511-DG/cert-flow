import { findActiveAttempt } from "@/lib/exam/engine";
import { listAttemptsForUser } from "@/lib/exam/store";
import { listExams } from "@/lib/catalog/repository";
import { listPurchasesForUser } from "@/lib/commerce/order-store";
import { ensureDemoAttempts } from "@/lib/dashboard/demo-seed";
import { DEMO_USER_ID } from "@/lib/auth/types";
import type { StoredPurchase } from "@/lib/commerce/types";
import type { AttemptRecord } from "@/lib/exam/types";

export type DashboardStats = {
  averageScore: number | null;
  testsCompleted: number;
  testsPurchased: number;
  progressPercent: number;
};

export type PurchasedTestRow = StoredPurchase & {
  previousAttempts: AttemptRecord[];
  inProgress: AttemptRecord | null;
};

export async function getLearnerDashboard(userId: string) {
  if (userId === DEMO_USER_ID) {
    await ensureDemoAttempts();
  }

  const [purchases, attempts, catalog] = await Promise.all([
    listPurchasesForUser(userId),
    listAttemptsForUser(userId),
    listExams({ sort: "popular", pageSize: 24, page: 1 }),
  ]);

  const submitted = attempts.filter((item) => item.status === "SUBMITTED" && item.scorePercent != null);
  const averageScore =
    submitted.length === 0
      ? null
      : Math.round(submitted.reduce((sum, item) => sum + (item.scorePercent ?? 0), 0) / submitted.length);

  const uniqueCompleted = new Set(submitted.map((item) => `${item.vendorSlug}/${item.examSlug}`));
  const testsPurchased = purchases.length;
  const progressPercent =
    testsPurchased === 0 ? 0 : Math.min(100, Math.round((uniqueCompleted.size / testsPurchased) * 100));

  const purchasedKeys = new Set(purchases.map((item) => `${item.vendorSlug}/${item.examSlug}`));
  const recommended = catalog.items
    .filter((exam) => !purchasedKeys.has(`${exam.vendorSlug}/${exam.examSlug}`))
    .slice(0, 3);

  const purchasedRows: PurchasedTestRow[] = await Promise.all(
    purchases.map(async (purchase) => {
      const previousAttempts = attempts.filter(
        (item) => item.vendorSlug === purchase.vendorSlug && item.examSlug === purchase.examSlug,
      );
      const inProgress = await findActiveAttempt(userId, purchase.vendorSlug, purchase.examSlug);
      return { ...purchase, previousAttempts, inProgress };
    }),
  );

  const stats: DashboardStats = {
    averageScore,
    testsCompleted: submitted.length,
    testsPurchased,
    progressPercent,
  };

  return {
    purchases: purchasedRows,
    attempts,
    submitted,
    recentAttempts: attempts.slice(0, 5),
    recommended,
    stats,
  };
}
