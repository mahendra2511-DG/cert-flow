import { redirect } from "next/navigation";
import { route } from "@/lib/routes";

export default function LibraryPage() {
  redirect(route("/dashboard/tests"));
}
