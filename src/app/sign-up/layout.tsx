import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Sign up",
  description: "Create a Certiva account.",
  path: "/sign-up",
  noIndex: true,
});

export default function SignUpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
