import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
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
    return { ok: false as const, response: NextResponse.json({ error: "Sign in required." }, { status: 401 }) };
  }
  if (session.user.role !== "admin") {
    return { ok: false as const, response: NextResponse.json({ error: "Admin access required." }, { status: 403 }) };
  }
  return { ok: true as const, user: session.user };
}
