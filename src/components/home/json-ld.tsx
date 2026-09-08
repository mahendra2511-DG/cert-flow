import { JsonLd } from "@/components/seo/json-ld";
import { faqs } from "@/lib/catalog/data";
import { faqJsonLd, organizationJsonLd, websiteJsonLd } from "@/lib/seo/structured-data";

export function HomeJsonLd() {
  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={websiteJsonLd()} />
      <JsonLd data={faqJsonLd(faqs)} />
    </>
  );
}
