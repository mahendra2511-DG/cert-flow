import { absoluteUrl, brand } from "@/lib/seo";

export type BreadcrumbItem = { href?: string; label: string };

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: absoluteUrl(item.href) } : {}),
    })),
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: brand.name,
    description: brand.description,
    url: absoluteUrl("/"),
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: brand.name,
    url: absoluteUrl("/"),
    description: brand.description,
    potentialAction: {
      "@type": "SearchAction",
      target: `${absoluteUrl("/certifications")}?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function faqJsonLd(faqs: Array<{ question: string; answer: string }>) {
  if (faqs.length === 0) {
    return null;
  }
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function itemListJsonLd(
  name: string,
  items: Array<{ name: string; url: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: absoluteUrl(item.url),
    })),
  };
}

export function examProductJsonLd(input: {
  name: string;
  description: string;
  url: string;
  pricePaise: number;
  ratingAverage?: number;
  ratingCount?: number;
}) {
  const product: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.url),
    brand: { "@type": "Brand", "name": brand.name },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: (input.pricePaise / 100).toFixed(2),
      availability: "https://schema.org/InStock",
      url: absoluteUrl(input.url),
    },
  };
  if (input.ratingCount && input.ratingCount > 0 && input.ratingAverage) {
    product.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: input.ratingAverage,
      reviewCount: input.ratingCount,
      bestRating: 5,
      worstRating: 1,
    };
  }
  return product;
}

export function courseJsonLd(input: {
  name: string;
  description: string;
  url: string;
  providerName?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.url),
    provider: {
      "@type": "Organization",
      name: input.providerName ?? brand.name,
    },
    isAccessibleForFree: false,
  };
}
