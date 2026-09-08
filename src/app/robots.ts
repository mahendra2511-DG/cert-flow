import { absoluteUrl } from "@/lib/seo";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/account",
          "/library",
          "/dashboard",
          "/dashboard/",
          "/sign-in",
          "/sign-up",
          "/forgot-password",
          "/reset-password",
          "/exam",
          "/exam/",
          "/results",
          "/results/",
          "/checkout",
          "/checkout/",
          "/admin",
          "/admin/",
          "/forbidden",
          "/api/",
          "/practice-test/*/start",
          "/practice-test/*/question",
          "/practice-test/*/result",
        ],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/").replace(/\/$/, ""),
  };
}
