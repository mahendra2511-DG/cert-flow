import { redirect } from "next/navigation";
import { route } from "@/lib/routes";

export default function AdminPaymentsPage() {
  redirect(route("/admin/orders"));
}
