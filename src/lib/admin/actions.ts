"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { updateUserRole } from "@/lib/auth/user-store";
import {
  deleteExam,
  deleteQuestion,
  deleteTest,
  deleteVendor,
  saveExam,
  saveQuestion,
  saveTest,
  saveVendor,
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
  await requireAdmin();
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
  await requireAdmin();
  deleteVendor(str(formData, "slug"));
  redirect(route("/admin/certifications"));
}

export async function toggleCertificationAction(formData: FormData) {
  await requireAdmin();
  toggleVendorPublished(str(formData, "slug"));
  redirect(route("/admin/certifications"));
}

export async function saveExamAction(formData: FormData) {
  await requireAdmin();
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
  await requireAdmin();
  deleteExam(str(formData, "vendorSlug"), str(formData, "slug"));
  redirect(route("/admin/exams"));
}

export async function toggleExamAction(formData: FormData) {
  await requireAdmin();
  toggleExamPublished(str(formData, "vendorSlug"), str(formData, "slug"));
  redirect(route("/admin/exams"));
}

export async function saveTestAction(formData: FormData) {
  await requireAdmin();
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
  });
  redirect(route("/admin/tests"));
}

export async function deleteTestAction(formData: FormData) {
  await requireAdmin();
  deleteTest(str(formData, "slug"));
  redirect(route("/admin/tests"));
}

export async function toggleTestAction(formData: FormData) {
  await requireAdmin();
  toggleTestPublished(str(formData, "slug"));
  redirect(route("/admin/tests"));
}

export async function saveQuestionAction(formData: FormData) {
  await requireAdmin();
  const labels = ["A", "B", "C", "D", "E"];
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
    difficulty: str(formData, "difficulty") || "Intermediate",
    category: str(formData, "category") || "General",
    tags: str(formData, "tags")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    type: correctCount > 1 ? "MULTIPLE_CHOICE" : "SINGLE_CHOICE",
    options,
  });
  redirect(route("/admin/questions"));
}

export async function deleteQuestionAction(formData: FormData) {
  await requireAdmin();
  deleteQuestion(str(formData, "id"));
  redirect(route("/admin/questions"));
}

export async function updateRoleAction(formData: FormData) {
  await requireAdmin();
  const role = str(formData, "role") === "admin" ? "admin" : "learner";
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
