import Link from "next/link";
import { EmptyState } from "@/components/ui-patterns/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getLiveQuestions, listTestsAdmin } from "@/lib/admin/catalog-store";
import { deleteTestAction, toggleTestAction } from "@/lib/admin/actions";
import { ConfirmForm } from "@/components/ui/confirm-form";
import { route } from "@/lib/routes";

export default async function AdminPapersPage({
  searchParams,
}: {
  searchParams: Promise<{ vendor?: string; exam?: string }>;
}) {
  const { vendor, exam } = await searchParams;
  const tests = listTestsAdmin().filter((item) => {
    if (vendor && item.vendorSlug !== vendor) {
      return false;
    }
    if (exam && item.examSlug !== exam) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Papers</h1>
          <p className="mt-2 text-muted-foreground">
            Timed practice papers. Free papers stay open without payment. Premium papers require a
            verified purchase.
          </p>
        </div>
        <Button nativeButton={false} render={<Link href={route("/admin/papers/new")} />}>
          Create paper
        </Button>
      </div>
      {tests.length === 0 ? (
        <EmptyState
          title="No papers"
          description="Create a free or premium paper and attach questions from the exam bank."
          actionHref={route("/admin/papers/new")}
          actionLabel="Create paper"
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
                    <Badge variant={test.paperType === "FREE" ? "secondary" : "default"}>
                      {test.paperType === "FREE" ? "Free" : "Premium"}
                    </Badge>
                    <Badge variant={test.isPublished ? "default" : "secondary"}>
                      {test.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {getLiveQuestions(test.slug).length} questions · {test.timeLimitMin} min · pass {test.passingScore}%
                    · {test.selectionMethod.toLowerCase()}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    nativeButton={false}
                    size="sm"
                    variant="outline"
                    render={<Link href={route(`/admin/papers/${test.slug}`)} />}
                  >
                    Edit
                  </Button>
                  <Button
                    nativeButton={false}
                    size="sm"
                    variant="outline"
                    render={<Link href={route(`/admin/papers/${test.slug}/builder`)} />}
                  >
                    Question builder
                  </Button>
                  <form action={toggleTestAction}>
                    <input type="hidden" name="slug" value={test.slug} />
                    <Button type="submit" size="sm" variant="secondary">
                      {test.isPublished ? "Unpublish" : "Publish"}
                    </Button>
                  </form>
                  <ConfirmForm
                    action={deleteTestAction}
                    title="Delete this paper?"
                    description="This sitting will be removed from the catalog."
                    confirmLabel="Delete"
                  >
                    <input type="hidden" name="slug" value={test.slug} />
                    <Button type="submit" size="sm" variant="destructive">
                      Delete
                    </Button>
                  </ConfirmForm>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
