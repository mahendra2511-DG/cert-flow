import Link from "next/link";
import { FileText } from "lucide-react";
import { EmptyState } from "@/components/ui-patterns/empty-state";
import { Button } from "@/components/ui/button";
import { ConfirmForm } from "@/components/ui/confirm-form";
import { listExamsAdmin } from "@/lib/admin/catalog-store";
import { listPremiumPdfs } from "@/lib/pdf/store";
import { deletePremiumPdfAction, savePremiumPdfAction } from "@/lib/admin/pdf-actions";

export default function AdminPdfsPage() {
  const exams = listExamsAdmin();
  const pdfs = listPremiumPdfs();
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Premium PDFs</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Upload belongs to an exam. Downloads are authorized only after a verified purchase.
        </p>
      </div>
      <form action={savePremiumPdfAction} className="max-w-xl space-y-4 rounded-2xl border p-5">
        <label className="block text-sm font-medium">
          Exam
          <select name="examKey" required className="mt-1 h-10 w-full rounded-lg border px-2.5 text-sm">
            {exams.map((exam) => (
              <option key={`${exam.vendorSlug}/${exam.slug}`} value={`${exam.vendorSlug}/${exam.slug}`}>
                {exam.code} · {exam.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium">
          Title
          <input name="title" required className="mt-1 h-10 w-full rounded-lg border px-2.5 text-sm" />
        </label>
        <label className="block text-sm font-medium">
          Description
          <textarea name="description" className="mt-1 min-h-20 w-full rounded-lg border px-2.5 py-2 text-sm" />
        </label>
        <label className="block text-sm font-medium">
          Version
          <input name="version" defaultValue="2026.1" className="mt-1 h-10 w-full rounded-lg border px-2.5 text-sm" />
        </label>
        <label className="block text-sm font-medium">
          PDF file (optional — a study PDF is generated if omitted)
          <input name="file" type="file" accept="application/pdf" className="mt-1 block w-full text-sm" />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isPublished" defaultChecked />
          Published
        </label>
        <Button type="submit">Save PDF</Button>
      </form>

      {pdfs.length === 0 ? (
        <EmptyState title="No PDFs yet" description="Upload or generate a notes PDF for an exam." />
      ) : (
        <ul className="space-y-3">
          {pdfs.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4">
              <div>
                <p className="font-medium">
                  {item.title} · {item.vendorSlug}/{item.examSlug}
                </p>
                <p className="text-xs text-muted-foreground">
                  v{item.version} · {item.status} · {item.questionCount} items · {item.filename}
                </p>
              </div>
              <ConfirmForm
                action={deletePremiumPdfAction}
                title="Delete this PDF?"
                description="Learners will not be able to download it until you upload again."
              >
                <input type="hidden" name="vendorSlug" value={item.vendorSlug} />
                <input type="hidden" name="examSlug" value={item.examSlug} />
                <Button type="submit" size="sm" variant="destructive">
                  Delete
                </Button>
              </ConfirmForm>
            </li>
          ))}
        </ul>
      )}
      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <FileText className="size-3.5" />
        Files are stored privately and streamed only after authorization.
      </p>
      <Button nativeButton={false} variant="outline" render={<Link href="/admin" />}>
        Back to overview
      </Button>
    </div>
  );
}
