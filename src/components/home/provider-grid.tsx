import Link from "next/link";
import type { Route } from "next";
import { PageContainer, SectionHeader } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { ProviderMark } from "@/components/brand/provider-mark";
import { EmptyState } from "@/components/ui-patterns/empty-state";
import { route } from "@/lib/routes";

export type ProviderCardData = {
  slug: string;
  name: string;
  description: string;
  examCount: number;
  initials?: string;
};

export function ProviderGrid({ providers }: { providers: ProviderCardData[] }) {
  return (
    <section className="py-16 sm:py-20" aria-labelledby="providers-heading">
      <PageContainer>
        <SectionHeader
          titleId="providers-heading"
          eyebrow="Providers"
          title="Practice by certification provider"
          description="Open a provider to see every published exam. Logos are stylized marks, not official vendor assets."
          action={
            <Link href="/certifications" className="text-sm font-medium text-primary hover:underline">
              All certifications
            </Link>
          }
        />
        {providers.length === 0 ? (
          <EmptyState
            title="Providers are being prepared"
            description="Published vendors will appear here."
            actionHref="/certifications"
            actionLabel="Open the catalog"
          />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {providers.map((provider) => (
              <li key={provider.slug}>
                <article className="flex h-full flex-col rounded-2xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
                  <ProviderMark slug={provider.slug} name={provider.name} initials={provider.initials} />
                  <h3 className="mt-4 font-heading text-lg font-semibold">{provider.name}</h3>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground">{provider.description}</p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {provider.examCount} {provider.examCount === 1 ? "exam" : "exams"}
                  </p>
                  <Button
                    nativeButton={false}
                    className="mt-4"
                    variant="outline"
                    render={<Link href={route(`/certifications/${provider.slug}`) as Route} />}
                  >
                    Explore
                  </Button>
                </article>
              </li>
            ))}
          </ul>
        )}
      </PageContainer>
    </section>
  );
}
