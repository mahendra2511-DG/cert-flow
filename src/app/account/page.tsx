import { redirect } from "next/navigation";
import { route } from "@/lib/routes";

export default function AccountPage() {
  redirect(route("/dashboard/profile"));
}
