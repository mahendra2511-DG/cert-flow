import { Suspense } from "react";
import { HomeFaq } from "@/components/home/faq";
import { HomeFinalCta } from "@/components/home/final-cta";
import { HomeHero } from "@/components/home/hero";
import { HomeSkeleton } from "@/components/home/home-skeleton";
import { HowItWorks } from "@/components/home/how-it-works";
import { HomeJsonLd } from "@/components/home/json-ld";
import { PopularCategories } from "@/components/home/popular-categories";
import { PopularPracticeTests } from "@/components/home/popular-tests";
import { Testimonials } from "@/components/home/testimonials";
import { WhyChooseUs } from "@/components/home/why-choose-us";
import { getHomepageContent } from "@/lib/catalog/queries";
import { brand, createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Certification practice tests",
  description: brand.description,
  path: "/",
});

async function HomeSections() {
  const content = await getHomepageContent();

  return (
    <>
      <HomeHero
        examCount={content.stats.exams}
        questionCount={content.stats.questions}
        sittingsLabel={content.stats.sittingsLabel}
      />
      <PopularCategories categories={content.popularCategories} />
      <PopularPracticeTests tests={content.popularTests} />
      <WhyChooseUs />
      <HowItWorks />
      <Testimonials items={content.testimonials} />
      <HomeFaq items={content.faqs} />
      <HomeFinalCta />
    </>
  );
}

export default function HomePage() {
  return (
    <>
      <HomeJsonLd />
      <Suspense fallback={<HomeSkeleton />}>
        <HomeSections />
      </Suspense>
    </>
  );
}
