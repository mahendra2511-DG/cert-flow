import type { NextAuthConfig } from "next-auth";

const protectedPrefixes = ["/dashboard", "/account", "/library", "/checkout"];

export const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = Boolean(auth?.user);
      const isProtected = protectedPrefixes.some((prefix) =>
        request.nextUrl.pathname.startsWith(prefix),
      );
      if (isProtected) {
        return isLoggedIn;
      }
      return true;
    },
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.sub = user.id;
        token.name = user.name;
        token.email = user.email;
      }
      if (trigger === "update" && session) {
        const next = session as { name?: string; email?: string };
        if (typeof next.name === "string") {
          token.name = next.name;
        }
        if (typeof next.email === "string") {
          token.email = next.email;
        }
      }
      return token;
    },
    session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.sub ?? "",
        name: token.name,
        email: token.email ?? "",
      };
      return session;
    },
  },
} satisfies NextAuthConfig;
