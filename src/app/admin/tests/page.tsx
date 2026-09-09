import { redirect } from "next/navigation";
import { route } from "@/lib/routes";

export default function LegacyTestsPage() {
  redirect(route("/admin/papers"));
}
