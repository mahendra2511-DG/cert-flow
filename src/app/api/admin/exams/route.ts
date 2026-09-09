import { z } from "zod";
import { requireStaffApi } from "@/lib/auth/session";
import { saveExam } from "@/lib/admin/catalog-store";
import { jsonError, jsonOk, parseJson } from "@/lib/http";

const schema = z.object({
  vendorSlug: z.string().min(1),
  name: z.string().min(1),
  code: z.string().min(1),
  description: z.string().min(1),
  priceInr: z.number().nonnegative(),
  durationMin: z.number().optional(),
  freeQuestionLimit: z.number().optional(),
  isPublished: z.boolean().optional(),
});

export async function POST(request: Request) {
  const gate = await requireStaffApi();
  if (!gate.ok) {
    return gate.response;
  }
  const parsed = await parseJson(request, schema, "Exam fields are required.");
  if (!parsed.ok) {
    return parsed.response;
  }
  try {
    const exam = saveExam({
      vendorSlug: parsed.value.vendorSlug,
      name: parsed.value.name,
      code: parsed.value.code,
      description: parsed.value.description,
      summary: parsed.value.description.slice(0, 140),
      pricePaise: Math.round(parsed.value.priceInr * 100),
      durationMin: parsed.value.durationMin ?? 60,
      questionCount: 0,
      seoTitle: `${parsed.value.code} practice test`,
      seoDescription: parsed.value.description.slice(0, 160),
      isPublished: parsed.value.isPublished ?? false,
      freeQuestionLimit: parsed.value.freeQuestionLimit ?? 20,
    });
    return jsonOk({
      vendorSlug: exam.vendorSlug,
      slug: exam.slug,
      testSlug: exam.tests[0]?.slug,
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not save exam.", 400);
  }
}
