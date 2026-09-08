import { NextResponse } from "next/server";

export function jsonError(error: string, status: number, extra?: Record<string, unknown>) {
  return NextResponse.json({ error, ...extra }, { status });
}

export function jsonOk(body: Record<string, unknown> = {}, status = 200) {
  return NextResponse.json({ ok: true, ...body }, { status });
}

export async function readJsonBody(request: Request): Promise<{ ok: true; value: unknown } | { ok: false; response: NextResponse }> {
  try {
    return { ok: true, value: await request.json() };
  } catch {
    return { ok: false, response: jsonError("Invalid JSON body.", 400) };
  }
}

export async function parseJson<T>(
  request: Request,
  schema: { safeParse: (value: unknown) => { success: true; data: T } | { success: false } },
  invalidMessage: string,
): Promise<{ ok: true; value: T } | { ok: false; response: NextResponse }> {
  const body = await readJsonBody(request);
  if (!body.ok) {
    return body;
  }
  const parsed = schema.safeParse(body.value);
  if (!parsed.success) {
    return { ok: false, response: jsonError(invalidMessage, 400) };
  }
  return { ok: true, value: parsed.data };
}
