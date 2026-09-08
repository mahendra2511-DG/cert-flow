import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

/**
 * Edge-safe Auth.js gate. Do not import `@/auth` here — that module pulls Prisma,
 * bcrypt, and server secrets that must never ship in the middleware bundle.
 *
 * Next.js 16 requires a function default export (or a function named `proxy`).
 * Auth.js `auth` is that request handler.
 */
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/account/:path*",
    "/library/:path*",
    "/checkout/:path*",
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};
