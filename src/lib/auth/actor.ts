import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { auth } from "@/auth";

export const GUEST_COOKIE = "ph_guest";

export type Actor = {
  id: string;
  kind: "user" | "guest";
};

export async function readActor(): Promise<Actor | null> {
  const session = await auth();
  if (session?.user?.id) {
    return { id: session.user.id, kind: "user" };
  }
  const jar = await cookies();
  const guest = jar.get(GUEST_COOKIE)?.value;
  if (guest?.startsWith("guest_")) {
    return { id: guest, kind: "guest" };
  }
  return null;
}

export async function ensureActor(): Promise<Actor> {
  const existing = await readActor();
  if (existing) {
    return existing;
  }
  const id = `guest_${randomBytes(12).toString("hex")}`;
  const jar = await cookies();
  jar.set(GUEST_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  });
  return { id, kind: "guest" };
}
