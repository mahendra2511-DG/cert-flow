import Link from "next/link";
import { Check } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { route } from "@/lib/routes";

const benefits = [
  "Full question bank",
  "Premium practice tests",
  "Detailed explanations",
  "Progress tracking",
  "Downloadable PDF",
  "Lifetime access where applicable",
];

export function PremiumPitch() {
  return (
    <section
      id="premium"
      className="bg-[linear-gradient(160deg,oklch(0.28_0.08_275),oklch(0.22_0.06_250))] py-16 text-white sm:py-20"
      aria-labelledby="premium-heading"
    >
      <PageContainer>
        <p className="text-sm font-medium text-indigo-200">Premium</p>
        <h2 id="premium-heading" className="mt-2 max-w-2xl font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Need more than 20 questions?
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-indigo-100 sm:text-base">
          Unlock the complete practice experience with premium questions, detailed explanations, and
          downloadable study material.
        </p>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm">
              <Check className="size-4 text-indigo-200" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
        <Button
          nativeButton={false}
          className="mt-8 bg-white text-indigo-950 hover:bg-indigo-50"
          render={<Link href={route("/premium-tests")} />}
        >
          View premium tests
        </Button>
      </PageContainer>
    </section>
  );
}
