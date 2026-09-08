import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth/session";
import { getTestAdmin, importQuestions } from "@/lib/admin/catalog-store";
import { parseImportPayload, validateImportRows } from "@/lib/admin/import";

const bodySchema = z.object({
  testSlug: z.string().min(1),
  filename: z.string().min(1),
  content: z.string(),
  commit: z.boolean().optional(),
});

export async function POST(request: Request) {
  const gate = await requireAdminApi();
  if (!gate.ok) {
    return gate.response;
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "testSlug, filename, and content are required." }, { status: 400 });
  }

  const { testSlug, filename, content, commit } = parsed.data;
  if (!getTestAdmin(testSlug)) {
    return NextResponse.json({ error: "That practice test does not exist." }, { status: 404 });
  }

  let rows;
  try {
    rows = parseImportPayload(content, filename);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not parse the upload." },
      { status: 400 },
    );
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
    return NextResponse.json(payload);
  }

  if (result.valid.length === 0) {
    return NextResponse.json(
      { ...payload, error: "No valid questions to import." },
      { status: 400 },
    );
  }

  importQuestions(
    testSlug,
    result.valid.map((item) => item.question),
  );

  return NextResponse.json({ ...payload, importedCount: result.valid.length });
}
