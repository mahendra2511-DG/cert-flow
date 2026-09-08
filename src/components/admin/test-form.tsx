import { saveTestAction } from "@/lib/admin/actions";
import { getTestAdmin, listExamsAdmin } from "@/lib/admin/catalog-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function TestForm({ testSlug }: { testSlug?: string }) {
  const found = testSlug ? getTestAdmin(testSlug) : null;
  const exams = listExamsAdmin();
  const test = found?.test;
  const exam = found?.exam;
  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">{test ? "Edit practice test" : "Create practice test"}</h1>
      <form action={saveTestAction} className="space-y-4">
        <input type="hidden" name="originalSlug" value={test?.slug ?? ""} />
        <div className="space-y-2">
          <Label htmlFor="examKey">Exam</Label>
          <select
            id="examKey"
            name="examKey"
            required
            defaultValue={exam ? `${exam.vendorSlug}/${exam.slug}` : undefined}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            {exams.map((item) => (
              <option key={`${item.vendorSlug}-${item.slug}`} value={`${item.vendorSlug}/${item.slug}`}>
                {item.code} · {item.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="title">Test name</Label>
          <Input id="title" name="title" required defaultValue={test?.title} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" name="slug" defaultValue={test?.slug} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="summary">Summary</Label>
          <Input id="summary" name="summary" required defaultValue={test?.summary} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            name="description"
            required
            defaultValue={test?.description}
            className="min-h-24 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="priceInr">Price (INR)</Label>
            <Input
              id="priceInr"
              name="priceInr"
              type="number"
              min={0}
              required
              defaultValue={test ? Math.round(test.pricePaise / 100) : 899}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="timeLimitMin">Duration (minutes)</Label>
            <Input id="timeLimitMin" name="timeLimitMin" type="number" min={1} required defaultValue={test?.timeLimitMin ?? 60} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="passingScore">Passing score</Label>
            <Input id="passingScore" name="passingScore" type="number" min={1} max={100} required defaultValue={test?.passingScore ?? 70} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="questionCount">Question count</Label>
            <Input id="questionCount" name="questionCount" type="number" min={0} required defaultValue={test?.questionCount ?? 0} />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isPublished" defaultChecked={test?.isPublished ?? true} />
          Published
        </label>
        <Button type="submit">Save test</Button>
      </form>
    </div>
  );
}
