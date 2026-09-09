import { NextResponse } from "next/server";
import { requireStaffApi } from "@/lib/auth/session";
import { jsonError } from "@/lib/http";
import { getPremiumPdfAny, readPremiumPdfBytes } from "@/lib/pdf/store";

export async function GET(request: Request) {
  const gate = await requireStaffApi();
  if (!gate.ok) {
    return gate.response;
  }
  const url = new URL(request.url);
  const vendor = url.searchParams.get("vendor") ?? "";
  const exam = url.searchParams.get("exam") ?? "";
  const record = getPremiumPdfAny(vendor, exam);
  if (!record) {
    return jsonError("PDF not found.", 404);
  }
  const bytes = readPremiumPdfBytes(record);
  return new NextResponse(new Uint8Array(bytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${record.filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
