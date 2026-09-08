import { saveExamAction } from "@/lib/admin/actions";
import { getLiveQuestions, listVendorsAdmin, type LiveExam } from "@/lib/admin/catalog-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ExamForm({ exam }: { exam?: LiveExam | null }) {
  const vendors = listVendorsAdmin();
  const test = exam?.tests[0];
  const questionCount = exam && test ? getLiveQuestions(test.slug).length : test?.questionCount ?? 0;
  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">{exam ? "Edit exam" : "Create exam"}</h1>
      <form action={saveExamAction} className="space-y-4">
        <input type="hidden" name="originalSlug" value={exam?.slug ?? ""} />
        <div className="space-y-2">
          <Label htmlFor="vendorSlug">Vendor</Label>
          <select
            id="vendorSlug"
            name="vendorSlug"
            required
            defaultValue={exam?.vendorSlug}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            {vendors.map((vendor) => (
              <option key={vendor.slug} value={vendor.slug}>
                {vendor.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Exam name</Label>
          <Input id="name" name="name" required defaultValue={exam?.name} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="code">Exam code</Label>
          <Input id="code" name="code" required defaultValue={exam?.code} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" name="slug" defaultValue={exam?.slug} placeholder="auto from code" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            name="description"
            required
            defaultValue={exam?.description}
            className="min-h-28 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm"
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
              step="1"
              required
              defaultValue={test ? Math.round(test.pricePaise / 100) : 899}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="durationMin">Duration (minutes)</Label>
            <Input
              id="durationMin"
              name="durationMin"
              type="number"
              min={1}
              required
              defaultValue={exam?.durationMin ?? 60}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="questionCount">Question count</Label>
            <Input
              id="questionCount"
              name="questionCount"
              type="number"
              min={0}
              required
              defaultValue={questionCount}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="level">Level</Label>
            <Input id="level" name="level" defaultValue={exam?.level ?? "Associate"} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="seoTitle">SEO title</Label>
          <Input id="seoTitle" name="seoTitle" defaultValue={exam?.seoTitle} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="seoDescription">SEO description</Label>
          <textarea
            id="seoDescription"
            name="seoDescription"
            defaultValue={exam?.seoDescription}
            className="min-h-24 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm"
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isPublished" defaultChecked={exam?.isPublished ?? true} />
          Published
        </label>
        <Button type="submit">Save exam</Button>
      </form>
    </div>
  );
}
