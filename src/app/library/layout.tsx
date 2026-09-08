import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Library",
  description: "Purchased practice tests.",
  path: "/library",
  noIndex: true,
});

export default function LibraryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
