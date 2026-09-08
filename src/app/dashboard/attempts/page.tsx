import Link from "next/link";
import type { Route } from "next";
import { requireUser } from "@/lib/auth/session";
import { getLearnerDashboard } from "@/lib/dashboard/queries";
import { formatDateTime, formatDuration } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui-patterns/empty-state";
import { createMetadata } from "@/lib/seo";
import { route } from "@/lib/routes";

export const metadata = createMetadata({
  title: "Attempts",
  description: "Your practice-test sittings, scores, and reviews.",
  path: "/dashboard/attempts",
  noIndex: true,
});

export default async function DashboardAttemptsPage() {
  const user = await requireUser();
  const { attempts } = await getLearnerDashboard(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Attempts</h1>
        <p className="mt-2 text-muted-foreground">
          Score, pass or fail, time taken, and a review link for every sitting on this account.
        </p>
      </div>

      {attempts.length === 0 ? (
        <EmptyState
          title="No sittings recorded"
          description="Start a purchased test to see scores and review explanations here."
          actionHref={route("/dashboard/tests")}
          actionLabel="Go to purchased tests"
        />
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-2xl border md:block">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-muted/50 text-xs tracking-wide text-muted-foreground uppercase">
                <tr>
                  <th className="px-4 py-3 font-medium">Exam</th>
                  <th className="px-4 py-3 font-medium">Attempt date</th>
                  <th className="px-4 py-3 font-medium">Score</th>
                  <th className="px-4 py-3 font-medium">Percentage</th>
                  <th className="px-4 py-3 font-medium">Result</th>
                  <th className="px-4 py-3 font-medium">Time taken</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {attempts.map((attempt) => {
                  const passed =
                    attempt.status === "SUBMITTED" &&
                    attempt.scorePercent != null &&
                    attempt.scorePercent >= attempt.passingScore;
                  return (
                    <tr key={attempt.id} className="border-t">
                      <td className="px-4 py-3">
                        <p className="font-medium">{attempt.examName}</p>
                        <p className="text-xs text-muted-foreground">{attempt.examCode}</p>
                      </td>
                      <td className="px-4 py-3">{formatDateTime(attempt.startedAt)}</td>
                      <td className="px-4 py-3">
                        {attempt.correctCount != null
                          ? `${attempt.correctCount} correct`
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {attempt.scorePercent != null ? `${attempt.scorePercent}%` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {attempt.status === "IN_PROGRESS" ? (
                          <Badge variant="secondary">In progress</Badge>
                        ) : (
                          <Badge variant={passed ? "default" : "destructive"}>
                            {passed ? "Pass" : "Fail"}
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">{formatDuration(attempt.timeTakenSec)}</td>
                      <td className="px-4 py-3 text-right">
                        <AttemptAction attempt={attempt} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <ul className="space-y-3 md:hidden">
            {attempts.map((attempt) => {
              const passed =
                attempt.status === "SUBMITTED" &&
                attempt.scorePercent != null &&
                attempt.scorePercent >= attempt.passingScore;
              return (
                <li key={attempt.id} className="rounded-2xl border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{attempt.examName}</p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(attempt.startedAt)}</p>
                    </div>
                    {attempt.status === "IN_PROGRESS" ? (
                      <Badge variant="secondary">In progress</Badge>
                    ) : (
                      <Badge variant={passed ? "default" : "destructive"}>
                        {passed ? "Pass" : "Fail"}
                      </Badge>
                    )}
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <dt className="text-xs text-muted-foreground">Score</dt>
                      <dd>{attempt.correctCount != null ? `${attempt.correctCount} correct` : "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Percentage</dt>
                      <dd>{attempt.scorePercent != null ? `${attempt.scorePercent}%` : "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Time taken</dt>
                      <dd>{formatDuration(attempt.timeTakenSec)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Exam code</dt>
                      <dd>{attempt.examCode}</dd>
                    </div>
                  </dl>
                  <div className="mt-4">
                    <AttemptAction attempt={attempt} />
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}

function AttemptAction({
  attempt,
}: {
  attempt: {
    id: string;
    status: "IN_PROGRESS" | "SUBMITTED";
    vendorSlug: string;
    examSlug: string;
    currentOrder: number;
  };
}) {
  if (attempt.status === "IN_PROGRESS") {
    return (
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
    );
  }
  return (
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
  );
}
