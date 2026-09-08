import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { jsonError } from "@/lib/http";
import { route } from "@/lib/routes";

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    redirect(route("/sign-in?callbackUrl=/dashboard"));
  }
  return session.user;
}

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    redirect(route("/sign-in?callbackUrl=/admin"));
  }
  if (session.user.role !== "admin") {
    redirect(route("/forbidden"));
  }
  return session.user;
}

export async function getOptionalUser() {
  const session = await auth();
  return session?.user ?? null;
}

export async function requireAdminApi() {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return { ok: false as const, response: jsonError("Sign in required.", 401) };
  }
  if (session.user.role !== "admin") {
    return { ok: false as const, response: jsonError("Admin access required.", 403) };
  }
  return { ok: true as const, user: session.user };
}
