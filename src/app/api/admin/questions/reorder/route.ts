import { z } from "zod";
import { requireStaffApi } from "@/lib/auth/session";
import { reorderQuestions } from "@/lib/admin/catalog-store";
import { jsonOk, parseJson } from "@/lib/http";

const schema = z.object({
  testSlug: z.string().min(1),
  ids: z.array(z.string()),
});

export async function POST(request: Request) {
  const gate = await requireStaffApi();
  if (!gate.ok) {
    return gate.response;
  }
  const parsed = await parseJson(request, schema, "testSlug and ids are required.");
  if (!parsed.ok) {
    return parsed.response;
  }
  reorderQuestions(parsed.value.testSlug, parsed.value.ids);
  return jsonOk({ ok: true });
}
