import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

/**
 * Edge-safe Auth.js gate. Do not import `@/auth` here — that module pulls Prisma,
 * bcrypt, and server secrets that must never ship in the middleware bundle.
 */
export const { auth: proxy } = NextAuth(authConfig);

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
