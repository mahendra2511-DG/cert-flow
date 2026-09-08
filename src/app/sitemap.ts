import { getPublicExams, getPublicVendors } from "@/lib/admin/catalog-store";
import { examPath, vendorPath } from "@/lib/catalog/seed-catalog";
import { absoluteUrl, practiceTestPath } from "@/lib/seo";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticEntries: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/certifications"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/practice-tests"), lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: absoluteUrl("/about"), lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: absoluteUrl("/resources"), lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: absoluteUrl("/support"), lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: absoluteUrl("/privacy"), lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: absoluteUrl("/terms"), lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: absoluteUrl("/contact"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const vendorEntries = getPublicVendors().map((vendor) => ({
    url: absoluteUrl(vendorPath(vendor.slug)),
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const examEntries = getPublicExams().flatMap((exam) => [
    {
      url: absoluteUrl(examPath(exam.vendorSlug, exam.slug)),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    },
    {
      url: absoluteUrl(practiceTestPath(exam.vendorSlug, exam.slug)),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.75,
    },
  ]);

  return [...staticEntries, ...vendorEntries, ...examEntries];
}
