"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { getExamAdmin } from "@/lib/admin/catalog-store";
import { buildStudyPdf } from "@/lib/pdf/document";
import { deletePremiumPdf, savePremiumPdf } from "@/lib/pdf/store";
import { route } from "@/lib/routes";

function str(form: FormData, key: string) {
  return String(form.get(key) ?? "").trim();
}

export async function savePremiumPdfAction(formData: FormData) {
  await requireAdmin();
  const [vendorSlug, examSlug] = str(formData, "examKey").split("/");
  const exam = vendorSlug && examSlug ? getExamAdmin(vendorSlug, examSlug) : null;
  if (!exam) {
    redirect(route("/admin/pdfs"));
  }
  const file = formData.get("file");
  let bytes: Buffer;
  let filename = `${exam.code.toLowerCase()}-premium-notes.pdf`;
  if (file instanceof File && file.size > 0) {
    if (file.size > 8 * 1024 * 1024) {
      redirect(route("/admin/pdfs"));
    }
    bytes = Buffer.from(await file.arrayBuffer());
    filename = file.name.replace(/[^\w.-]+/g, "-");
  } else {
    bytes = buildStudyPdf({
      title: str(formData, "title") || `${exam.code} Premium Study Notes`,
      examCode: exam.code,
      examName: exam.name,
      version: str(formData, "version") || "2026.1",
      questionCount: exam.tests[0]?.questionCount ?? 0,
    });
  }
  savePremiumPdf({
    vendorSlug,
    examSlug,
    title: str(formData, "title") || `${exam.code} Premium Study Notes`,
    description: str(formData, "description"),
    version: str(formData, "version") || "2026.1",
    status: formData.get("isPublished") ? "published" : "draft",
    questionCount: exam.tests[0]?.questionCount ?? 0,
    filename,
    bytes,
  });
  redirect(route("/admin/pdfs"));
}

export async function deletePremiumPdfAction(formData: FormData) {
  await requireAdmin();
  deletePremiumPdf(str(formData, "vendorSlug"), str(formData, "examSlug"));
  redirect(route("/admin/pdfs"));
}
