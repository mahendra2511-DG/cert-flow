import Link from "next/link";
import { EmptyState } from "@/components/ui-patterns/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listQuestionsAdmin, listTestsAdmin } from "@/lib/admin/catalog-store";
import { deleteQuestionAction } from "@/lib/admin/actions";
import { ConfirmForm } from "@/components/ui/confirm-form";
import { route } from "@/lib/routes";

export default async function AdminQuestionsPage({
  searchParams,
}: {
  searchParams: Promise<{ test?: string }>;
}) {
  const { test } = await searchParams;
  const tests = listTestsAdmin();
  const questions = listQuestionsAdmin(test);
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Questions</h1>
          <p className="mt-2 text-muted-foreground">
            Prompt, correct answers, explanation, difficulty, tags, and category.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button nativeButton={false} variant="outline" render={<Link href={route("/admin/questions/import")} />}>
            Bulk import
          </Button>
          <Button nativeButton={false} render={<Link href={route("/admin/questions/new")} />}>
            Add question
          </Button>
        </div>
      </div>
      <form className="flex flex-wrap items-end gap-2" method="get">
        <label className="text-sm">
          <span className="mb-1 block text-muted-foreground">Filter by test</span>
          <select
            name="test"
            defaultValue={test ?? ""}
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            <option value="">All tests</option>
            {tests.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.examCode} · {item.title}
              </option>
            ))}
          </select>
        </label>
        <Button type="submit" size="sm" variant="secondary">
          Apply
        </Button>
      </form>
      {questions.length === 0 ? (
        <EmptyState
          title="No questions"
          description="Add a question or import a validated CSV/JSON file."
          actionHref={route("/admin/questions/new")}
          actionLabel="Add question"
        />
      ) : (
      <ul className="space-y-3">
        {questions.map((question) => (
          <li key={question.id} className="rounded-2xl border p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <p className="font-medium">{question.prompt}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="outline">{question.testSlug}</Badge>
                  <Badge variant="secondary">{question.difficulty}</Badge>
                  <Badge variant="secondary">{question.category}</Badge>
                  <Badge>{question.type === "MULTIPLE_CHOICE" ? "Multiple answers" : "Single answer"}</Badge>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Correct: {question.options.filter((option) => option.isCorrect).map((option) => option.label).join(", ") || "—"}
                  {question.tags?.length ? ` · Tags: ${question.tags.join(", ")}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  nativeButton={false}
                  size="sm"
                  variant="outline"
                  render={<Link href={route(`/admin/questions/${question.id}`)} />}
                >
                  Edit
                </Button>
                <ConfirmForm
                  action={deleteQuestionAction}
                  title="Delete this question?"
                  description="This item will be removed from the practice test immediately."
                  confirmLabel="Delete"
                >
                  <input type="hidden" name="id" value={question.id} />
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
