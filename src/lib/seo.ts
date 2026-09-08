import type { Metadata } from "next";
import { siteUrl as publicSiteUrl } from "@/lib/site-url";

export const brand = {
  name: "PrepHarbor",
  tagline: "Practice tests built for how professionals actually study.",
  description:
    "PrepHarbor is a certification practice-test marketplace. Browse exams by provider, preview a test, purchase access, then sit the exam online and review explanations.",
};

export function absoluteUrl(path = "/") {
  const normalized = path.startsWith("http") ? path : path.startsWith("/") ? path : `/${path}`;
  if (normalized.startsWith("http")) {
    return normalized;
  }
  return new URL(normalized, `${publicSiteUrl()}/`).toString();
}

export function truncateMeta(value: string, max = 158) {
  const text = value.replace(/\s+/g, " ").trim();
  if (text.length <= max) {
    return text;
  }
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

export type CreateMetadataInput = {
  title: string;
  description: string;
  path?: string;
  canonicalPath?: string;
  noIndex?: boolean;
  ogType?: "website" | "article";
};

export function createMetadata({
  title,
  description,
  path = "/",
  canonicalPath,
  noIndex = false,
  ogType = "website",
}: CreateMetadataInput): Metadata {
  const canonical = absoluteUrl(canonicalPath ?? path);
  const summary = truncateMeta(description);
  const isHome = (canonicalPath ?? path) === "/";
  const displayTitle = isHome ? `${brand.name} · Certification practice tests` : `${title} · ${brand.name}`;
  const ogImage = absoluteUrl("/opengraph-image");

  return {
    title: isHome ? { absolute: displayTitle } : title,
    description: summary,
    applicationName: brand.name,
    alternates: { canonical },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          nocache: true,
          googleBot: { index: false, follow: false, noimageindex: true },
        }
      : { index: true, follow: true },
    openGraph: {
      type: ogType,
      locale: "en_IN",
      url: canonical,
      siteName: brand.name,
      title: displayTitle,
      description: summary,
      images: [{ url: ogImage, width: 1200, height: 630, alt: brand.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: displayTitle,
      description: summary,
      images: [ogImage],
    },
  };
}

export function practiceTestPath(vendorSlug: string, examSlug: string) {
  return `/practice-test/${vendorSlug}/${examSlug}`;
}
