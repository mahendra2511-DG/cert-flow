import Link from "next/link";
import { EmptyState } from "@/components/ui-patterns/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listExamsAdmin, listVendorsAdmin } from "@/lib/admin/catalog-store";
import { deleteExamAction, toggleExamAction } from "@/lib/admin/actions";
import { formatInr } from "@/lib/format";
import { ConfirmForm } from "@/components/ui/confirm-form";
import { route } from "@/lib/routes";

export default function AdminExamsPage() {
  const exams = listExamsAdmin();
  const vendors = listVendorsAdmin();
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Exams</h1>
          <p className="mt-2 text-muted-foreground">
            Vendor, code, price, duration, SEO, and publish status for each certification exam.
          </p>
        </div>
        <Button nativeButton={false} variant="outline" render={<Link href={route("/admin/content/wizard")} />}>
          + Add new exam
        </Button>
        <Button nativeButton={false} render={<Link href={route("/admin/exams/new")} />}>
          Create exam
        </Button>
      </div>
      {exams.length === 0 ? (
        <EmptyState
          title="No exams"
          description="Create an exam with vendor, code, price, duration, SEO, and publish status."
          actionHref={route("/admin/exams/new")}
          actionLabel="Create exam"
        />
      ) : (
      <div className="overflow-x-auto rounded-2xl border">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-muted/50 text-xs tracking-wide text-muted-foreground uppercase">
            <tr>
              <th className="px-3 py-2 font-medium">Exam</th>
              <th className="px-3 py-2 font-medium">Vendor</th>
              <th className="px-3 py-2 font-medium">Price</th>
              <th className="px-3 py-2 font-medium">Duration</th>
              <th className="px-3 py-2 font-medium">Questions</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {exams.map((exam) => {
              const vendor = vendors.find((item) => item.slug === exam.vendorSlug);
              const test = exam.tests[0];
              return (
                <tr key={`${exam.vendorSlug}-${exam.slug}`} className="border-t">
                  <td className="px-3 py-2">
                    <p className="font-medium">{exam.name}</p>
                    <p className="font-mono text-xs text-muted-foreground">{exam.code}</p>
                  </td>
                  <td className="px-3 py-2">{vendor?.name ?? exam.vendorSlug}</td>
                  <td className="px-3 py-2">{formatInr(test?.pricePaise ?? 0)}</td>
                  <td className="px-3 py-2">{exam.durationMin} min</td>
                  <td className="px-3 py-2">{test?.questionCount ?? 0}</td>
                  <td className="px-3 py-2">
                    <Badge variant={exam.isPublished ? "default" : "secondary"}>
                      {exam.isPublished ? "Published" : "Unpublished"}
                    </Badge>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button
                        nativeButton={false}
                        size="sm"
                        variant="outline"
                        render={<Link href={route(`/admin/exams/${exam.vendorSlug}/${exam.slug}/content`)} />}
                      >
                        Content
                      </Button>
                      <Button
                        nativeButton={false}
                        size="sm"
                        variant="outline"
                        render={<Link href={route(`/admin/exams/${exam.vendorSlug}/${exam.slug}`)} />}
                      >
                        Edit
                      </Button>
                      <form action={toggleExamAction}>
                        <input type="hidden" name="vendorSlug" value={exam.vendorSlug} />
                        <input type="hidden" name="slug" value={exam.slug} />
                        <Button type="submit" size="sm" variant="secondary">
                          {exam.isPublished ? "Unpublish" : "Publish"}
                        </Button>
                      </form>
                      <ConfirmForm
                        action={deleteExamAction}
                        title="Delete this exam?"
                        description="Practice tests and questions for this exam will be removed from the live catalog."
                        confirmLabel="Delete"
                      >
                        <input type="hidden" name="vendorSlug" value={exam.vendorSlug} />
                        <input type="hidden" name="slug" value={exam.slug} />
                        <Button type="submit" size="sm" variant="destructive">
                          Delete
                        </Button>
                      </ConfirmForm>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
}
