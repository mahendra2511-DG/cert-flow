import { requireStaffApi } from "@/lib/auth/session";
import { getExamAdmin } from "@/lib/admin/catalog-store";
import { savePremiumPdf } from "@/lib/pdf/store";
import { jsonError, jsonOk } from "@/lib/http";

export async function POST(request: Request) {
  const gate = await requireStaffApi();
  if (!gate.ok) {
    return gate.response;
  }
  const form = await request.formData();
  const [vendorSlug, examSlug] = String(form.get("examKey") ?? "").split("/");
  const exam = vendorSlug && examSlug ? getExamAdmin(vendorSlug, examSlug) : null;
  if (!exam) {
    return jsonError("Exam not found.", 404);
  }
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return jsonError("PDF file is required.", 400);
  }
  if (file.size > 8 * 1024 * 1024) {
    return jsonError("PDF is larger than 8 MB.", 400);
  }
  const bytes = Buffer.from(await file.arrayBuffer());
  const record = savePremiumPdf({
    vendorSlug,
    examSlug,
    title: String(form.get("title") ?? `${exam.code} Premium PDF`),
    description: String(form.get("description") ?? ""),
    version: String(form.get("version") ?? "v1.0"),
    status: form.get("isPublished") ? "published" : "draft",
    questionCount: exam.tests[0]?.questionCount ?? 0,
    filename: file.name.replace(/[^\w.-]+/g, "-"),
    bytes,
  });
  return jsonOk({ id: record.id, filename: record.filename, version: record.version });
}
