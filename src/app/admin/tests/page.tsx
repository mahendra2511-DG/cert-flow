import Link from "next/link";
import { EmptyState } from "@/components/ui-patterns/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getLiveQuestions, listTestsAdmin } from "@/lib/admin/catalog-store";
import { deleteTestAction, toggleTestAction } from "@/lib/admin/actions";
import { formatInr } from "@/lib/format";
import { route } from "@/lib/routes";

export default function AdminTestsPage() {
  const tests = listTestsAdmin();
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Practice tests</h1>
          <p className="mt-2 text-muted-foreground">Timed sittings attached to an exam. Unpublished tests are hidden from checkout.</p>
        </div>
        <Button nativeButton={false} render={<Link href={route("/admin/tests/new")} />}>
          Create test
        </Button>
      </div>
      {tests.length === 0 ? (
        <EmptyState
          title="No practice tests"
          description="Attach a timed sitting to an exam before importing questions."
          actionHref={route("/admin/tests/new")}
          actionLabel="Create test"
        />
      ) : (
      <ul className="space-y-3">
        {tests.map((test) => (
          <li key={test.slug} className="rounded-2xl border p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold">{test.title}</h2>
                  <Badge variant="outline">{test.examCode}</Badge>
                  <Badge variant={test.isPublished ? "default" : "secondary"}>
                    {test.isPublished ? "Published" : "Unpublished"}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatInr(test.pricePaise)} · {test.timeLimitMin} min · {getLiveQuestions(test.slug).length} questions
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  nativeButton={false}
                  size="sm"
                  variant="outline"
                  render={<Link href={route(`/admin/tests/${test.slug}`)} />}
                >
                  Edit
                </Button>
                <form action={toggleTestAction}>
                  <input type="hidden" name="slug" value={test.slug} />
                  <Button type="submit" size="sm" variant="secondary">
                    {test.isPublished ? "Unpublish" : "Publish"}
                  </Button>
                </form>
                <form action={deleteTestAction}>
                  <input type="hidden" name="slug" value={test.slug} />
                  <Button type="submit" size="sm" variant="destructive">
                    Delete
                  </Button>
                </form>
              </div>
            </div>
          </li>
        ))}
      </ul>
      )}
    </div>
  );
}
