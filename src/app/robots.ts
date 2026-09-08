import { absoluteUrl } from "@/lib/seo";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/account", "/library", "/exam", "/results", "/checkout", "/api"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
