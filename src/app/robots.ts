import { absoluteUrl } from "@/lib/seo";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/account",
        "/library",
        "/exam",
        "/results",
        "/checkout",
        "/api",
        "/practice-test/*/start",
        "/practice-test/*/question",
        "/practice-test/*/result",
      ],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
