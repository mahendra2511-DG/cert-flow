import Link from "next/link";
import { CertificationCard, PracticeTestCard } from "@/components/catalog/cards";
import { Button } from "@/components/ui/button";
import { certifications, practiceTests, providers } from "@/lib/catalog/data";
import { brand, createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Certification practice tests",
  description: brand.description,
  path: "/",
});

export default function HomePage() {
  return (
    <div>
      <section className="border-b bg-[radial-gradient(circle_at_top_left,oklch(0.92_0.04_185),transparent_42%),linear-gradient(180deg,oklch(0.97_0.02_95),transparent)]">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:py-20">
          <div>
            <p className="text-sm font-medium tracking-wide text-primary uppercase">
              Practice-test marketplace
            </p>
            <h1 className="mt-3 max-w-xl text-4xl leading-tight font-semibold sm:text-5xl">
              Find a certification. Sit a timed practice exam. Review what you missed.
            </h1>
            <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
              PrepHarbor is an independent catalog of original practice tests. Search by vendor or
              exam code, buy access in INR via Razorpay, then take the test in your browser.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button nativeButton={false} render={<Link href="/certifications" />} size="lg">
                Browse certifications
              </Button>
              <Button
                nativeButton={false}
                render={<Link href="/practice-tests" />}
                variant="outline"
                size="lg"
              >
                See practice tests
              </Button>
            </div>
          </div>
          <div className="grid gap-3 self-center">
            {providers.map((provider) => (
              <div key={provider.slug} className="rounded-xl border bg-card px-4 py-3 shadow-sm">
                <p className="font-medium">{provider.name}</p>
                <p className="text-sm text-muted-foreground">{provider.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Featured certifications</h2>
            <p className="text-sm text-muted-foreground">
              Start from a vendor track, then open a test for pricing and format.
            </p>
          </div>
          <Link href="/certifications" className="text-sm font-medium text-primary hover:underline">
            View all
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {certifications.map((item) => (
            <CertificationCard key={item.slug} item={item} />
          ))}
        </div>
      </section>

      <section className="border-t bg-muted/30">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="text-2xl font-semibold">Practice tests ready to purchase</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Checkout and exam-taking flows are scaffolded; this catalog is live with sample data.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {practiceTests.map((item) => (
              <PracticeTestCard key={item.slug} item={item} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
