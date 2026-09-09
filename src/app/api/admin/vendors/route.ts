import { z } from "zod";
import { requireStaffApi } from "@/lib/auth/session";
import { saveVendor, slugify } from "@/lib/admin/catalog-store";
import { jsonError, jsonOk, parseJson } from "@/lib/http";

const schema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  slug: z.string().optional(),
  isPublished: z.boolean().optional(),
});

export async function POST(request: Request) {
  const gate = await requireStaffApi();
  if (!gate.ok) {
    return gate.response;
  }
  const parsed = await parseJson(request, schema, "Provider name is required.");
  if (!parsed.ok) {
    return parsed.response;
  }
  try {
    const slug = saveVendor({
      slug: parsed.value.slug || slugify(parsed.value.name),
      name: parsed.value.name,
      description: parsed.value.description || `${parsed.value.name} certification practice.`,
      longDescription: parsed.value.description || `${parsed.value.name} certification practice.`,
      isPublished: parsed.value.isPublished ?? true,
    });
    return jsonOk({ slug });
  } catch {
    return jsonError("Could not save provider.", 400);
  }
}
