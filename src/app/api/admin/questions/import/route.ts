import { z } from "zod";
import { requireStaffApi } from "@/lib/auth/session";
import { getTestAdmin, importQuestions } from "@/lib/admin/catalog-store";
import { parseImportPayload, validateImportRows } from "@/lib/admin/import";
import { jsonError, jsonOk, parseJson } from "@/lib/http";

const bodySchema = z.object({
  testSlug: z.string().min(1),
  filename: z.string().min(1),
  content: z.string(),
  commit: z.boolean().optional(),
});

export async function POST(request: Request) {
  const gate = await requireStaffApi();
  if (!gate.ok) {
    return gate.response;
  }

  const parsed = await parseJson(request, bodySchema, "testSlug, filename, and content are required.");
  if (!parsed.ok) {
    return parsed.response;
  }

  const { testSlug, filename, content, commit } = parsed.value;
  if (!getTestAdmin(testSlug)) {
    return jsonError("That practice test does not exist.", 404);
  }

  let rows;
  try {
    rows = parseImportPayload(content, filename);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not parse the upload.", 400);
  }

  const result = validateImportRows(rows, testSlug);
  const payload = {
    rowCount: rows.length,
    validCount: result.valid.length,
    invalidCount: result.invalid.length,
    duplicateCount: result.duplicates.length,
    errors: result.invalid,
    duplicates: result.duplicates,
    importedCount: 0,
  };

  if (!commit) {
    return jsonOk(payload);
  }

  if (result.valid.length === 0) {
    return jsonError("No valid questions to import.", 400, payload);
  }

  importQuestions(
    testSlug,
    result.valid.map((item) => item.question),
  );

  return jsonOk({ ...payload, importedCount: result.valid.length });
}
