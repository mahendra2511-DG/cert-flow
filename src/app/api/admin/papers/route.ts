import { z } from "zod";
import { requireStaffApi } from "@/lib/auth/session";
import { saveTest } from "@/lib/admin/catalog-store";
import { jsonError, jsonOk, parseJson } from "@/lib/http";

const schema = z.object({
  vendorSlug: z.string().min(1),
  examSlug: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().optional(),
  description: z.string().optional(),
  timeLimitMin: z.number().optional(),
  passingScore: z.number().optional(),
  questionCount: z.number().optional(),
  paperType: z.enum(["FREE", "PREMIUM"]),
  selectionMethod: z.enum(["RANDOM", "FIXED", "CATEGORY"]).optional(),
  isPublished: z.boolean().optional(),
  priceInr: z.number().optional(),
});

export async function POST(request: Request) {
  const gate = await requireStaffApi();
  if (!gate.ok) {
    return gate.response;
  }
  const parsed = await parseJson(request, schema, "Paper fields are required.");
  if (!parsed.ok) {
    return parsed.response;
  }
  try {
    const slug = saveTest({
      vendorSlug: parsed.value.vendorSlug,
      examSlug: parsed.value.examSlug,
      title: parsed.value.title,
      summary: parsed.value.summary || parsed.value.title,
      description: parsed.value.description || parsed.value.title,
      pricePaise: Math.round((parsed.value.priceInr ?? (parsed.value.paperType === "FREE" ? 0 : 499)) * 100),
      timeLimitMin: parsed.value.timeLimitMin ?? 40,
      passingScore: parsed.value.passingScore ?? 70,
      questionCount: parsed.value.questionCount ?? 20,
      isPublished: parsed.value.isPublished ?? true,
      paperType: parsed.value.paperType,
      selectionMethod: parsed.value.selectionMethod ?? "RANDOM",
    });
    return jsonOk({ slug });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not save paper.", 400);
  }
}
