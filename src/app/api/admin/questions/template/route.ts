import { requireStaffApi } from "@/lib/auth/session";
import { CSV_TEMPLATE } from "@/lib/admin/import";

export async function GET() {
  const gate = await requireStaffApi();
  if (!gate.ok) {
    return gate.response;
  }
  return new Response(CSV_TEMPLATE, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="questions-template.csv"',
    },
  });
}
