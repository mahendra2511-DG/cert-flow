import { auth } from "@/auth";
import { jsonError, jsonOk } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { findExamContext, publicFreeQuestions, publicPremiumQuestions } from "@/lib/exam/engine";
import { userOwnsExam } from "@/lib/commerce/checkout";

function clientKey(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
}

export async function GET(request: Request) {
  const limited = rateLimit(`q:${clientKey(request)}`);
  if (!limited.ok) {
    return jsonError("Too many requests. Try again shortly.", 429);
  }

  const url = new URL(request.url);
  const vendor = url.searchParams.get("vendor") ?? "";
  const exam = url.searchParams.get("exam") ?? "";
  const tier = url.searchParams.get("tier") === "premium" ? "premium" : "free";

  if (!findExamContext(vendor, exam)) {
    return jsonError("Exam not found.", 404);
  }

  if (tier === "free") {
    const questions = publicFreeQuestions(vendor, exam);
    return jsonOk({ tier: "free", questions: questions ?? [] });
  }

  const session = await auth();
  if (!session?.user?.id) {
    return jsonError("Sign in required.", 401);
  }
  if (!(await userOwnsExam(session.user.id, vendor, exam))) {
    return jsonError("Premium access required.", 403);
  }
  const questions = publicPremiumQuestions(vendor, exam);
  return jsonOk({ tier: "premium", questions: questions ?? [] });
}
