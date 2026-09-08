import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role?: "admin" | "learner";
  }

  interface Session {
    user: {
      id: string;
      role: "admin" | "learner";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    name?: string | null;
    email?: string | null;
    role?: "admin" | "learner";
  }
}
