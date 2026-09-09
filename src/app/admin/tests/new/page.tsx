import { redirect } from "next/navigation";
import { route } from "@/lib/routes";

export default function LegacyNewTestPage() {
  redirect(route("/admin/papers/new"));
}
