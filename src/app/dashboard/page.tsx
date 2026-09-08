import Link from "next/link";
import type { Route } from "next";
import { requireUser } from "@/lib/auth/session";
import { getLearnerDashboard } from "@/lib/dashboard/queries";
import { formatDate, formatDuration } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui-patterns/empty-state";
import { route } from "@/lib/routes";

export default async function DashboardPage() {
  const user = await requireUser();
  const data = await getLearnerDashboard(user.id);
  const firstName = user.name?.split(" ")[0] ?? "there";

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-medium text-primary">Welcome back</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Hi {firstName}, keep the streak going</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Your purchased tests, recent sittings, and recommended next exams live here. Scores stay on
          this account until you sign out.
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Average score"
          value={data.stats.averageScore == null ? "—" : `${data.stats.averageScore}%`}
          hint="Submitted sittings only"
        />
        <StatCard
          label="Tests completed"
          value={String(data.stats.testsCompleted)}
          hint="Timed attempts you finished"
        />
        <StatCard
          label="In your library"
          value={String(data.stats.testsPurchased)}
          hint="Paid practice tests"
        />
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Progress</CardDescription>
            <CardTitle className="text-2xl">{data.stats.progressPercent}%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${data.stats.progressPercent}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Unique exams with a submitted attempt</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-3">
            <div>
              <CardTitle>Purchased practice tests</CardTitle>
              <CardDescription>Start or continue from the tests you own.</CardDescription>
            </div>
            <Button nativeButton={false} render={<Link href={route("/dashboard/tests")} />} variant="ghost" size="sm">
              View all
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.purchases.length === 0 ? (
              <EmptyState
                title="No purchases yet"
                description="Browse the catalog and check out to unlock timed sittings."
                actionHref="/practice-tests"
                actionLabel="Browse tests"
              />
            ) : (
              data.purchases.slice(0, 3).map((purchase) => (
                <div
                  key={purchase.id}
                  className="flex flex-col gap-2 rounded-xl border px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium">{purchase.testName}</p>
                    <p className="text-xs text-muted-foreground">
                      {purchase.examCode} · Bought {formatDate(purchase.purchasedAt)}
                    </p>
                  </div>
                  <Button
                    nativeButton={false}
                    render={
                      <Link
                        href={
                          `/practice-test/${purchase.vendorSlug}/${purchase.examSlug}/start` as Route
                        }
                      />
                    }
                    size="sm"
                  >
                    {purchase.inProgress ? "Continue" : "Start"}
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-3">
            <div>
              <CardTitle>Recent attempts</CardTitle>
              <CardDescription>Latest sittings, including in-progress work.</CardDescription>
            </div>
            <Button nativeButton={false} render={<Link href={route("/dashboard/attempts")} />} variant="ghost" size="sm">
              View all
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recentAttempts.length === 0 ? (
              <EmptyState
                title="No attempts yet"
                description="Open a purchased test and start a timed sitting."
                actionHref={route("/dashboard/tests")}
                actionLabel="Open library"
              />
            ) : (
              data.recentAttempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="flex flex-col gap-2 rounded-xl border px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium">{attempt.examName}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(attempt.startedAt)} · {attempt.examCode}
                      {attempt.status === "SUBMITTED" && attempt.scorePercent != null
                        ? ` · ${attempt.scorePercent}%`
                        : " · In progress"}
                      {attempt.timeTakenSec != null ? ` · ${formatDuration(attempt.timeTakenSec)}` : ""}
                    </p>
                  </div>
                  {attempt.status === "SUBMITTED" ? (
                    <Button
                      nativeButton={false}
                      size="sm"
                      variant="outline"
                      render={
                        <Link
                          href={
                            `/practice-test/${attempt.vendorSlug}/${attempt.examSlug}/result/${attempt.id}` as Route
                          }
                        />
                      }
                    >
                      Review
                    </Button>
                  ) : (
                    <Button
                      nativeButton={false}
                      size="sm"
                      render={
                        <Link
                          href={
                            `/practice-test/${attempt.vendorSlug}/${attempt.examSlug}/question/${attempt.currentOrder}?attempt=${attempt.id}` as Route
                          }
                        />
                      }
                    >
                      Continue
                    </Button>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Recommended tests</h2>
          <p className="text-sm text-muted-foreground">Popular exams that are not in your library yet.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.recommended.map((exam) => (
            <Card key={`${exam.vendorSlug}-${exam.examSlug}`}>
              <CardHeader>
                <Badge variant="secondary">{exam.code}</Badge>
                <CardTitle className="mt-2">{exam.name}</CardTitle>
                <CardDescription>{exam.summary}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  nativeButton={false}
                  className="w-full"
                  render={<Link href={exam.href as Route} />}
                >
                  View exam
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}
