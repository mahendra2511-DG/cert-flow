import { redirect } from "next/navigation";
import { route } from "@/lib/routes";

export default function AdminProvidersPage() {
  redirect(route("/admin/certifications"));
}
