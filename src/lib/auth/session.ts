import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { route } from "@/lib/routes";

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    redirect(route("/sign-in?callbackUrl=/dashboard"));
  }
  return session.user;
}

export async function getOptionalUser() {
  const session = await auth();
  return session?.user ?? null;
}
