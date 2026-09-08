import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/db";
import { findUserByEmail, verifyPassword } from "@/lib/auth/user-store";

function authSecret() {
  if (process.env.AUTH_SECRET) return process.env.AUTH_SECRET;
  if (process.env.NODE_ENV !== "production") return "prepharbor-dev-secret-change-me";
  // next build sets NODE_ENV=production; a dummy secret is only for compile, never for runtime.
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return "build-placeholder-not-for-runtime";
  }
  throw new Error("AUTH_SECRET is required in production.");
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: prisma ? PrismaAdapter(prisma) : undefined,
  secret: authSecret(),
  providers: [
    Credentials({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").toLowerCase().trim();
        const password = String(credentials?.password ?? "");
        if (!email || !password) {
          return null;
        }
        const user = await findUserByEmail(email);
        if (!user) {
          return null;
        }
        const ok = await verifyPassword(user, password);
        if (!ok) {
          return null;
        }
        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
});
