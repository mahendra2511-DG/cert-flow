import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PageContainer, SectionHeader } from "@/components/layout/page-container";
import type { CatalogFaq } from "@/lib/catalog/types";

export function HomeFaq({ items }: { items: CatalogFaq[] }) {
  return (
    <section id="faq" className="border-y bg-muted/30 py-16 sm:py-20" aria-labelledby="faq-heading">
      <PageContainer className="max-w-3xl">
        <SectionHeader
          titleId="faq-heading"
          eyebrow="FAQ"
          title="Questions before you buy"
          description="Short answers about independent practice content, INR payments, and what a purchase includes."
        />
        <Accordion>
          {items.map((item) => (
            <AccordionItem key={item.question} value={item.question}>
              <AccordionTrigger className="text-base">{item.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </PageContainer>
    </section>
  );
}
