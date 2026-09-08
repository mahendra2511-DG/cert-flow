import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/db";
import { findUserByEmail, verifyPassword } from "@/lib/auth/user-store";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: prisma ? PrismaAdapter(prisma) : undefined,
  secret: process.env.AUTH_SECRET ?? "prepharbor-dev-secret-change-me",
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
