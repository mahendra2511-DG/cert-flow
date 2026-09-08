import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";

export function HomeFinalCta() {
  return (
    <section className="py-16 sm:py-20" aria-labelledby="final-cta-heading">
      <PageContainer>
        <div className="rounded-3xl bg-primary px-6 py-12 text-primary-foreground sm:px-12">
          <h2 id="final-cta-heading" className="max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Pick an exam tonight. Sit it before the week is over.
          </h2>
          <p className="mt-3 max-w-xl text-sm text-primary-foreground/80 sm:text-base">
            Create a free account, browse the catalog, and purchase a practice test when you are
            ready. Demo sign-in is available while the database is being connected.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              nativeButton={false}
              render={<Link href="/sign-up" />}
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              size="lg"
            >
              Create an account
            </Button>
            <Button
              nativeButton={false}
              render={<Link href="/practice-tests" />}
              variant="outline"
              size="lg"
              className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              See practice tests
            </Button>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
