"use server";

import { redirect } from "next/navigation";
import { requireAdmin, requireStaff } from "@/lib/auth/session";
import { updateUserRole } from "@/lib/auth/user-store";
import { normalizeRole } from "@/lib/auth/roles";
import {
  deleteExam,
  deleteQuestion,
  deleteTest,
  deleteVendor,
  saveExam,
  saveQuestion,
  saveTest,
  saveVendor,
  setPaperQuestionIds,
  toggleExamPublished,
  toggleTestPublished,
  toggleVendorPublished,
} from "@/lib/admin/catalog-store";
import { route } from "@/lib/routes";

function str(form: FormData, key: string) {
  return String(form.get(key) ?? "").trim();
}

function bool(form: FormData, key: string) {
  return form.get(key) === "on" || form.get(key) === "true" || form.get(key) === "1";
}

function paise(form: FormData, key: string) {
  const rupees = Number(str(form, key));
  if (!Number.isFinite(rupees) || rupees < 0) {
    return 0;
  }
  return Math.round(rupees * 100);
}

export async function saveCertificationAction(formData: FormData) {
  await requireStaff();
  const slug = saveVendor({
    slug: str(formData, "slug") || undefined,
    name: str(formData, "name"),
    description: str(formData, "description"),
    longDescription: str(formData, "longDescription"),
    isPublished: bool(formData, "isPublished"),
  });
  redirect(route(`/admin/certifications?saved=${slug}`));
}

export async function deleteCertificationAction(formData: FormData) {
  await requireStaff();
  deleteVendor(str(formData, "slug"));
  redirect(route("/admin/certifications"));
}

export async function toggleCertificationAction(formData: FormData) {
  await requireStaff();
  toggleVendorPublished(str(formData, "slug"));
  redirect(route("/admin/certifications"));
}

export async function saveExamAction(formData: FormData) {
  await requireStaff();
  saveExam({
    originalSlug: str(formData, "originalSlug") || undefined,
    vendorSlug: str(formData, "vendorSlug"),
    slug: str(formData, "slug") || undefined,
    name: str(formData, "name"),
    code: str(formData, "code"),
    description: str(formData, "description"),
    summary: str(formData, "summary"),
    pricePaise: paise(formData, "priceInr"),
    durationMin: Number(str(formData, "durationMin") || 60),
    questionCount: Number(str(formData, "questionCount") || 0),
    seoTitle: str(formData, "seoTitle"),
    seoDescription: str(formData, "seoDescription"),
    isPublished: bool(formData, "isPublished"),
    level: str(formData, "level"),
    freeQuestionLimit: Number(str(formData, "freeQuestionLimit") || 20),
    premiumQuestionCount: Number(str(formData, "premiumQuestionCount") || 0) || undefined,
  });
  redirect(route("/admin/exams"));
}

export async function deleteExamAction(formData: FormData) {
  await requireStaff();
  deleteExam(str(formData, "vendorSlug"), str(formData, "slug"));
  redirect(route("/admin/exams"));
}

export async function toggleExamAction(formData: FormData) {
  await requireStaff();
  toggleExamPublished(str(formData, "vendorSlug"), str(formData, "slug"));
  redirect(route("/admin/exams"));
}

export async function saveTestAction(formData: FormData) {
  await requireStaff();
  const [vendorSlug, examSlug] = str(formData, "examKey").split("/");
  saveTest({
    originalSlug: str(formData, "originalSlug") || undefined,
    vendorSlug,
    examSlug,
    slug: str(formData, "slug") || undefined,
    title: str(formData, "title"),
    summary: str(formData, "summary"),
    description: str(formData, "description"),
    pricePaise: paise(formData, "priceInr"),
    timeLimitMin: Number(str(formData, "timeLimitMin") || 60),
    passingScore: Number(str(formData, "passingScore") || 70),
    questionCount: Number(str(formData, "questionCount") || 0),
    isPublished: bool(formData, "isPublished"),
    paperType: str(formData, "paperType") === "FREE" ? "FREE" : "PREMIUM",
    selectionMethod:
      str(formData, "selectionMethod") === "FIXED"
        ? "FIXED"
        : str(formData, "selectionMethod") === "CATEGORY"
          ? "CATEGORY"
          : "RANDOM",
    categoryFilter: str(formData, "categoryFilter") || undefined,
  });
  redirect(route("/admin/papers"));
}

export async function deleteTestAction(formData: FormData) {
  await requireStaff();
  deleteTest(str(formData, "slug"));
  redirect(route("/admin/papers"));
}

export async function toggleTestAction(formData: FormData) {
  await requireStaff();
  toggleTestPublished(str(formData, "slug"));
  redirect(route("/admin/papers"));
}

export async function saveQuestionAction(formData: FormData) {
  await requireStaff();
  const labels = ["A", "B", "C", "D", "E"];
  const type = str(formData, "questionType") === "MULTIPLE_CHOICE" ? "MULTIPLE_CHOICE" : "SINGLE_CHOICE";
  const options = labels.map((label) => ({
    label,
    body: str(formData, `option_${label}`),
    isCorrect: bool(formData, `correct_${label}`),
  }));
  const correctCount = options.filter((option) => option.isCorrect && option.body).length;
  saveQuestion({
    id: str(formData, "id") || undefined,
    testSlug: str(formData, "testSlug"),
    prompt: str(formData, "prompt"),
    explanation: str(formData, "explanation"),
    difficulty: str(formData, "difficulty") || "Medium",
    category: str(formData, "category") || "General",
    tags: str(formData, "tags")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    type: type === "SINGLE_CHOICE" && correctCount > 1 ? "MULTIPLE_CHOICE" : type,
    options,
    isFree: str(formData, "tier") !== "premium",
    status: str(formData, "status") === "draft" ? "draft" : "published",
    imageUrl: str(formData, "imageUrl") || undefined,
  });
  redirect(route("/admin/questions"));
}

export async function deleteQuestionAction(formData: FormData) {
  await requireStaff();
  deleteQuestion(str(formData, "id"));
  redirect(route("/admin/questions"));
}

export async function updateRoleAction(formData: FormData) {
  await requireAdmin();
  const role = normalizeRole(str(formData, "role"));
  try {
    await updateUserRole(str(formData, "id"), role);
  } catch (error) {
    if (error instanceof Error && error.message === "LAST_ADMIN") {
      redirect(route("/admin/users?error=last-admin"));
    }
    throw error;
  }
  redirect(route("/admin/users"));
}

export async function savePaperQuestionsAction(formData: FormData) {
  await requireStaff();
  const slug = str(formData, "slug");
  const ids = str(formData, "questionIds")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  setPaperQuestionIds(slug, ids);
  redirect(route(`/admin/papers/${slug}`));
}
