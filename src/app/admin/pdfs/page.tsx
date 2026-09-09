import Link from "next/link";
import { FileText } from "lucide-react";
import { EmptyState } from "@/components/ui-patterns/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmForm } from "@/components/ui/confirm-form";
import { listExamsAdmin } from "@/lib/admin/catalog-store";
import { listPremiumPdfs } from "@/lib/pdf/store";
import { deletePremiumPdfAction, savePremiumPdfAction, togglePremiumPdfAction } from "@/lib/admin/pdf-actions";
import { formatBytes, formatDateTime } from "@/lib/format";
import { route } from "@/lib/routes";

export default function AdminPdfsPage() {
  const exams = listExamsAdmin();
  const pdfs = listPremiumPdfs();
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Premium PDFs</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Files are stored privately (not under /public). Learners download only after a verified purchase.
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
          PDF type
          <select name="pdfType" className="mt-1 h-10 w-full rounded-lg border px-2.5 text-sm">
            <option value="PREMIUM_PDF">Premium PDF</option>
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
          <input name="version" defaultValue="v1.0" className="mt-1 h-10 w-full rounded-lg border px-2.5 text-sm" />
        </label>
        <label className="block text-sm font-medium">
          PDF file (replace existing for this exam)
          <input name="file" type="file" accept="application/pdf" className="mt-1 block w-full text-sm" />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isPublished" defaultChecked />
          Published
        </label>
        <Button type="submit">Upload / replace PDF</Button>
      </form>

      {pdfs.length === 0 ? (
        <EmptyState title="No PDFs yet" description="Upload a premium PDF for an exam." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="bg-muted/50 text-xs tracking-wide text-muted-foreground uppercase">
              <tr>
                <th className="px-3 py-2 font-medium">File</th>
                <th className="px-3 py-2 font-medium">Size</th>
                <th className="px-3 py-2 font-medium">Uploaded</th>
                <th className="px-3 py-2 font-medium">Version</th>
                <th className="px-3 py-2 font-medium">Exam</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Downloads</th>
                <th className="px-3 py-2 font-medium">Updated</th>
                <th className="px-3 py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {pdfs.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="px-3 py-2 font-medium">{item.filename}</td>
                  <td className="px-3 py-2">{formatBytes(item.fileSize ?? 0)}</td>
                  <td className="px-3 py-2">{formatDateTime(item.createdAt ?? item.updatedAt)}</td>
                  <td className="px-3 py-2">{item.version}</td>
                  <td className="px-3 py-2">
                    {item.vendorSlug}/{item.examSlug}
                  </td>
                  <td className="px-3 py-2">
                    <Badge variant={item.status === "published" ? "default" : "secondary"}>{item.status}</Badge>
                  </td>
                  <td className="px-3 py-2">{item.downloadCount ?? 0}</td>
                  <td className="px-3 py-2">{formatDateTime(item.updatedAt)}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button
                        nativeButton={false}
                        size="sm"
                        variant="outline"
                        render={
                          <a
                            href={`/api/admin/pdfs/preview?vendor=${item.vendorSlug}&exam=${item.examSlug}`}
                            target="_blank"
                            rel="noreferrer"
                          />
                        }
                      >
                        Preview
                      </Button>
                      <form action={togglePremiumPdfAction}>
                        <input type="hidden" name="vendorSlug" value={item.vendorSlug} />
                        <input type="hidden" name="examSlug" value={item.examSlug} />
                        <Button type="submit" size="sm" variant="secondary">
                          {item.status === "published" ? "Unpublish" : "Publish"}
                        </Button>
                      </form>
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <FileText className="size-3.5" />
        Unauthorized download requests return 403 Premium access required.
      </p>
      <Button nativeButton={false} variant="outline" render={<Link href={route("/admin/content")} />}>
        Back to content hub
      </Button>
    </div>
  );
}
