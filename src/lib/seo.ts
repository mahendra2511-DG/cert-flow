import type { Metadata } from "next";
import { siteUrl } from "@/lib/env";

export const brand = {
  name: "PrepHarbor",
  tagline: "Practice tests built for how professionals actually study.",
  description:
    "PrepHarbor is a certification practice-test marketplace. Browse exams by provider, preview a test, purchase access, then sit the exam online and review explanations.",
};

export function absoluteUrl(path = "/") {
  return new URL(path, `${siteUrl()}/`).toString();
}

export function createMetadata({
  title,
  description,
  path = "/",
  noIndex = false,
}: {
  title: string;
  description: string;
  path?: string;
  noIndex?: boolean;
}): Metadata {
  const url = absoluteUrl(path);
  const fullTitle = title === brand.name ? title : `${title} · ${brand.name}`;

  return {
    title: fullTitle,
    description,
    alternates: { canonical: url },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      type: "website",
      url,
      siteName: brand.name,
      title: fullTitle,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
  };
}
