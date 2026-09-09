import { requireStaffApi } from "@/lib/auth/session";
import { getQuestionAdmin, listExamQuestions, listQuestionsAdmin, questionsToCsv } from "@/lib/admin/catalog-store";

export async function GET(request: Request) {
  const gate = await requireStaffApi();
  if (!gate.ok) {
    return gate.response;
  }
  const url = new URL(request.url);
  const format = url.searchParams.get("format") === "json" ? "json" : "csv";
  const vendor = url.searchParams.get("vendor") ?? "";
  const exam = url.searchParams.get("exam") ?? "";
  const ids = (url.searchParams.get("ids") ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  const questions = ids.length
    ? ids.map((id) => getQuestionAdmin(id)).filter((item): item is NonNullable<typeof item> => Boolean(item))
    : vendor && exam
      ? listExamQuestions(vendor, exam)
      : listQuestionsAdmin();

  if (format === "json") {
    return new Response(JSON.stringify(questions, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": 'attachment; filename="questions.json"',
      },
    });
  }
  return new Response(questionsToCsv(questions), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="questions.csv"',
    },
  });
}
