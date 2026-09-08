import type { NextAuthConfig } from "next-auth";

const protectedPrefixes = ["/dashboard", "/account", "/library", "/checkout", "/admin"];

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
      const pathname = request.nextUrl.pathname;
      const isAdminPath = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
      const isLoggedIn = Boolean(auth?.user);
      const isProtected = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));

      if (isAdminPath) {
        if (!isLoggedIn) {
          return false;
        }
        if (auth?.user?.role !== "admin") {
          if (pathname.startsWith("/api/")) {
            return Response.json({ error: "Admin access required." }, { status: 403 });
          }
          return Response.redirect(new URL("/forbidden", request.nextUrl));
        }
        return true;
      }

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
        token.role = (user as { role?: "admin" | "learner" }).role === "admin" ? "admin" : "learner";
      }
      if (trigger === "update" && session) {
        const next = session as { name?: string; email?: string };
        if (typeof next.name === "string") {
          token.name = next.name;
        }
        if (typeof next.email === "string") {
          token.email = next.email;
        }
        // Role is never taken from the client session payload.
      }
      return token;
    },
    session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.sub ?? "",
        name: token.name,
        email: token.email ?? "",
        role: token.role === "admin" ? "admin" : "learner",
      };
      return session;
    },
  },
} satisfies NextAuthConfig;
