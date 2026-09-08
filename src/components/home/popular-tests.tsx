import Link from "next/link";
import { StarRating } from "@/components/catalog/star-rating";
import { PageContainer, SectionHeader } from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui-patterns/empty-state";
import { certificationBySlug } from "@/lib/catalog/data";
import type { CatalogPracticeTest } from "@/lib/catalog/types";
import { formatInrFromPaise } from "@/lib/utils";

export function PopularPracticeTests({ tests }: { tests: CatalogPracticeTest[] }) {
  return (
    <section className="border-y bg-muted/30 py-16 sm:py-20" aria-labelledby="popular-tests-heading">
      <PageContainer>
        <SectionHeader
          titleId="popular-tests-heading"
          eyebrow="Marketplace"
          title="Popular practice tests"
          description="Each listing shows the exam code, length, learner rating, and INR price. Open a test to purchase or preview the format."
          action={
            <Link href="/practice-tests" className="text-sm font-medium text-primary hover:underline">
              Browse the full catalog
            </Link>
          }
        />
        {tests.length === 0 ? (
          <EmptyState
            title="No popular tests yet"
            description="Featured exams will appear here once they are published."
            actionHref="/practice-tests"
            actionLabel="View practice tests"
          />
        ) : (
          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {tests.map((test) => {
              const cert = certificationBySlug(test.certificationSlug);
              return (
                <li key={test.slug}>
                  <Card className="h-full transition-shadow hover:shadow-md">
                    <CardHeader>
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="secondary">{cert?.code ?? "Exam"}</Badge>
                        <span className="text-xs text-muted-foreground">{cert?.name}</span>
                      </div>
                      <CardTitle className="font-heading text-lg leading-snug">{test.title}</CardTitle>
                      <StarRating value={test.ratingAverage} count={test.ratingCount} />
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm text-muted-foreground">{test.summary}</p>
                      <p className="text-sm">
                        <span className="font-medium">{test.questionCount} questions</span>
                        <span className="text-muted-foreground"> · {test.timeLimitMin} min</span>
                      </p>
                      <p className="text-xl font-semibold">{formatInrFromPaise(test.pricePaise)}</p>
                    </CardContent>
                    <CardFooter>
                      <Button
                        nativeButton={false}
                        render={<Link href={`/practice-tests/${test.slug}`} />}
                        className="w-full"
                      >
                        View exam
                      </Button>
                    </CardFooter>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </PageContainer>
    </section>
  );
}
