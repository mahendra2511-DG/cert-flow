import Link from "next/link";
import type { Route } from "next";
import { requireUser } from "@/lib/auth/session";
import { getLearnerDashboard } from "@/lib/dashboard/queries";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui-patterns/empty-state";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Purchased tests",
  description: "Practice tests you have purchased.",
  path: "/dashboard/tests",
  noIndex: true,
});

export default async function DashboardTestsPage() {
  const user = await requireUser();
  const { purchases } = await getLearnerDashboard(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Purchased tests</h1>
        <p className="mt-2 text-muted-foreground">
          Every practice test on this account, with purchase date, previous sittings, and a start or
          continue button.
        </p>
      </div>

      {purchases.length === 0 ? (
        <EmptyState
          title="Nothing in your library"
          description="Once checkout completes, tests appear here with unlimited retakes."
          actionHref="/practice-tests"
          actionLabel="Browse practice tests"
        />
      ) : (
        <ul className="space-y-4">
          {purchases.map((purchase) => {
            const submitted = purchase.previousAttempts.filter((item) => item.status === "SUBMITTED");
            return (
              <li key={purchase.id} className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold">{purchase.testName}</h2>
                      <Badge variant="outline">{purchase.examCode}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Purchased {formatDate(purchase.purchasedAt)} · Order {purchase.orderId}
                    </p>
                    <div>
                      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                        Previous attempts
                      </p>
                      {submitted.length === 0 ? (
                        <p className="mt-1 text-sm text-muted-foreground">No completed sittings yet.</p>
                      ) : (
                        <ul className="mt-2 space-y-1 text-sm">
                          {submitted.map((attempt) => (
                            <li key={attempt.id} className="flex flex-wrap items-center gap-x-3 gap-y-1">
                              <span>{formatDate(attempt.startedAt)}</span>
                              <span>{attempt.scorePercent}%</span>
                              <Link
                                href={
                                  `/practice-test/${attempt.vendorSlug}/${attempt.examSlug}/result/${attempt.id}` as Route
                                }
                                className="font-medium text-primary hover:underline"
                              >
                                Review
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
                    <Button
                      nativeButton={false}
                      render={
                        <Link
                          href={
                            `/practice-test/${purchase.vendorSlug}/${purchase.examSlug}/start` as Route
                          }
                        />
                      }
                    >
                      {purchase.inProgress ? "Continue" : "Start"}
                    </Button>
                    <Button
                      nativeButton={false}
                      variant="outline"
                      render={
                        <Link
                          href={
                            `/practice-test/${purchase.vendorSlug}/${purchase.examSlug}` as Route
                          }
                        />
                      }
                    >
                      Test overview
                    </Button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
