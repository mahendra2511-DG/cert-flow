import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { jsonError } from "@/lib/http";
import { userOwnsExam } from "@/lib/commerce/checkout";
import { findExamContext } from "@/lib/exam/engine";
import { getPremiumPdf, readPremiumPdfBytes, incrementPdfDownload } from "@/lib/pdf/store";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(
  request: Request,
  context: { params: Promise<{ examId: string }> },
) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!rateLimit(`pdf:${ip}`, 20).ok) {
    return jsonError("Too many download attempts.", 429);
  }

  const { examId } = await context.params;
  const [vendor, exam] = decodeURIComponent(examId).split("__");
  if (!vendor || !exam || !findExamContext(vendor, exam)) {
    return jsonError("Exam not found.", 404);
  }

  const session = await auth();
  if (!session?.user?.id) {
    return jsonError("Sign in required.", 401);
  }
  if (!(await userOwnsExam(session.user.id, vendor, exam))) {
    return jsonError("Purchase this exam to download the premium PDF.", 403);
  }

  const record = getPremiumPdf(vendor, exam);
  if (!record) {
    return jsonError("No premium PDF is published for this exam.", 404);
  }

  incrementPdfDownload(record);
  const bytes = readPremiumPdfBytes(record);
  return new NextResponse(new Uint8Array(bytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${record.filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
