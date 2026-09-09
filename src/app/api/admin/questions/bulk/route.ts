import { z } from "zod";
import { requireStaffApi } from "@/lib/auth/session";
import { bulkUpdateQuestions } from "@/lib/admin/catalog-store";
import { jsonError, jsonOk, parseJson } from "@/lib/http";

const schema = z.object({
  ids: z.array(z.string()).min(1),
  action: z.enum([
    "publish",
    "unpublish",
    "delete",
    "mark_free",
    "mark_premium",
    "category",
    "difficulty",
  ]),
  value: z.string().optional(),
});

export async function POST(request: Request) {
  const gate = await requireStaffApi();
  if (!gate.ok) {
    return gate.response;
  }
  const parsed = await parseJson(request, schema, "ids and action are required.");
  if (!parsed.ok) {
    return parsed.response;
  }
  if (parsed.value.action === "delete" && request.headers.get("x-confirm-delete") !== "yes") {
    return jsonError("Destructive bulk delete requires confirmation.", 400);
  }
  bulkUpdateQuestions(parsed.value.ids, parsed.value.action, parsed.value.value);
  return jsonOk({ updated: parsed.value.ids.length, action: parsed.value.action });
}
