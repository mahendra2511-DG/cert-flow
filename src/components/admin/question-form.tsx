import { saveQuestionAction } from "@/lib/admin/actions";
import { getQuestionAdmin, listTestsAdmin, type LiveQuestion } from "@/lib/admin/catalog-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const labels = ["A", "B", "C", "D", "E"] as const;

export function QuestionForm({ question }: { question?: LiveQuestion | null }) {
  const tests = listTestsAdmin();
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">{question ? "Edit question" : "Add question"}</h1>
      <form action={saveQuestionAction} className="space-y-4">
        <input type="hidden" name="id" value={question?.id ?? ""} />
        <div className="space-y-2">
          <Label htmlFor="testSlug">Practice test</Label>
          <select
            id="testSlug"
            name="testSlug"
            required
            defaultValue={question?.testSlug}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            {tests.map((test) => (
              <option key={test.slug} value={test.slug}>
                {test.examCode} · {test.title}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="prompt">Question</Label>
          <textarea
            id="prompt"
            name="prompt"
            required
            defaultValue={question?.prompt}
            className="min-h-28 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm"
          />
        </div>
        {labels.map((label) => {
          const option = question?.options.find((item) => item.label === label);
          return (
            <div key={label} className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
              <Label className="w-6">{label}</Label>
              <Input name={`option_${label}`} defaultValue={option?.body} placeholder={`Option ${label}`} />
              <label className="flex items-center gap-1 text-xs whitespace-nowrap">
                <input type="checkbox" name={`correct_${label}`} defaultChecked={option?.isCorrect} />
                Correct
              </label>
            </div>
          );
        })}
        <div className="space-y-2">
          <Label htmlFor="explanation">Explanation</Label>
          <textarea
            id="explanation"
            name="explanation"
            required
            defaultValue={question?.explanation}
            className="min-h-24 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty</Label>
            <Input id="difficulty" name="difficulty" defaultValue={question?.difficulty ?? "Intermediate"} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Question category</Label>
            <Input id="category" name="category" defaultValue={question?.category ?? "General"} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input id="tags" name="tags" defaultValue={question?.tags.join(", ")} placeholder="iam, vpc" />
          </div>
        </div>
        <Button type="submit">Save question</Button>
      </form>
    </div>
  );
}

export function QuestionFormById({ id }: { id?: string }) {
  const question = id ? getQuestionAdmin(id) : null;
  return <QuestionForm question={question} />;
}
