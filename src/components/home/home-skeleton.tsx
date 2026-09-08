import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer } from "@/components/layout/page-container";

export function HomeSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite">
      <PageContainer className="py-16">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="mt-4 h-14 w-full max-w-xl" />
        <Skeleton className="mt-4 h-20 w-full max-w-lg" />
        <Skeleton className="mt-8 h-12 w-full max-w-xl" />
      </PageContainer>
      <PageContainer className="pb-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-36" />
          ))}
        </div>
      </PageContainer>
    </div>
  );
}
