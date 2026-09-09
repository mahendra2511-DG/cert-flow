import Link from "next/link";
import { EmptyState } from "@/components/ui-patterns/empty-state";
import { Button } from "@/components/ui/button";
import { examContentOverview, listExamsAdmin, listTestsAdmin, listVendorsAdmin, queryQuestionsAdmin } from "@/lib/admin/catalog-store";
import { QuestionsTable } from "@/components/admin/questions-table";
import { route } from "@/lib/routes";

export default async function AdminQuestionsPage({
  searchParams,
}: {
  searchParams: Promise<{
    test?: string;
    vendor?: string;
    exam?: string;
    tier?: string;
    difficulty?: string;
    category?: string;
    status?: string;
    q?: string;
    sort?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const tests = listTestsAdmin();
  const vendors = listVendorsAdmin();
  const exams = listExamsAdmin();
  const result = queryQuestionsAdmin({
    testSlug: params.test,
    vendor: params.vendor,
    exam: params.exam,
    tier: params.tier === "premium" ? "premium" : params.tier === "free" ? "free" : undefined,
    difficulty: params.difficulty,
    category: params.category,
    status: params.status === "draft" || params.status === "published" ? params.status : undefined,
    q: params.q,
    sort: params.sort === "newest" || params.sort === "oldest" ? params.sort : "number",
    page: Number(params.page || 1),
    pageSize: 25,
  });
  const overview =
    params.vendor && params.exam ? examContentOverview(params.vendor, params.exam) : null;
  const pages = Math.max(1, Math.ceil(result.total / result.pageSize));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Questions</h1>
          <p className="mt-2 text-muted-foreground">
            Search, filter, reorder via import, and bulk-edit. Free questions are the ones learners see without paying.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button nativeButton={false} variant="outline" render={<a href="/api/admin/questions/template" />}>
            Download CSV template
          </Button>
          <Button nativeButton={false} variant="outline" render={<Link href={route("/admin/questions/import")} />}>
            Bulk import
          </Button>
          <Button nativeButton={false} render={<Link href={route("/admin/questions/new")} />}>
            Add question
          </Button>
        </div>
      </div>
      {overview ? (
        <p className="rounded-xl border bg-muted/40 px-4 py-3 text-sm">
          {overview.exam.code}: Total {overview.totalQuestions} · Free {overview.freeQuestions} · Premium{" "}
          {overview.premiumQuestions} · Published {overview.publishedQuestions} · Draft {overview.draftQuestions}
        </p>
      ) : null}
      <form className="grid gap-2 rounded-2xl border p-4 sm:grid-cols-2 lg:grid-cols-4" method="get">
        <Field label="Search">
          <input name="q" defaultValue={params.q} className="h-8 w-full rounded-lg border px-2.5 text-sm" />
        </Field>
        <Field label="Provider">
          <select name="vendor" defaultValue={params.vendor ?? ""} className="h-8 w-full rounded-lg border px-2.5 text-sm">
            <option value="">All</option>
            {vendors.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Exam">
          <select name="exam" defaultValue={params.exam ?? ""} className="h-8 w-full rounded-lg border px-2.5 text-sm">
            <option value="">All</option>
            {exams.map((item) => (
              <option key={`${item.vendorSlug}/${item.slug}`} value={item.slug}>
                {item.code}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Paper">
          <select name="test" defaultValue={params.test ?? ""} className="h-8 w-full rounded-lg border px-2.5 text-sm">
            <option value="">All papers</option>
            {tests.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.examCode} · {item.title}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Free / Premium">
          <select name="tier" defaultValue={params.tier ?? ""} className="h-8 w-full rounded-lg border px-2.5 text-sm">
            <option value="">All</option>
            <option value="free">Free</option>
            <option value="premium">Premium</option>
          </select>
        </Field>
        <Field label="Difficulty">
          <select name="difficulty" defaultValue={params.difficulty ?? ""} className="h-8 w-full rounded-lg border px-2.5 text-sm">
            <option value="">All</option>
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
        </Field>
        <Field label="Status">
          <select name="status" defaultValue={params.status ?? ""} className="h-8 w-full rounded-lg border px-2.5 text-sm">
            <option value="">All</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </Field>
        <Field label="Sort">
          <select name="sort" defaultValue={params.sort ?? "number"} className="h-8 w-full rounded-lg border px-2.5 text-sm">
            <option value="number">Question number</option>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </Field>
        <div className="flex items-end">
          <Button type="submit" size="sm">
            Apply filters
          </Button>
        </div>
      </form>
      {result.items.length === 0 ? (
        <EmptyState
          title="No questions"
          description="Add a question or import a validated CSV/JSON file."
          actionHref={route("/admin/questions/new")}
          actionLabel="Add question"
        />
      ) : (
        <QuestionsTable
          testSlug={params.test}
          questions={result.items.map((item) => ({
            id: item.id,
            order: item.order,
            prompt: item.prompt,
            testSlug: item.testSlug,
            difficulty: item.difficulty,
            category: item.category,
            isFree: item.isFree,
            status: item.status,
            type: item.type,
          }))}
        />
      )}
      {pages > 1 ? (
        <p className="text-sm text-muted-foreground">
          Page {result.page} of {pages} · {result.total} questions
        </p>
      ) : null}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="text-sm">
      <span className="mb-1 block text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
