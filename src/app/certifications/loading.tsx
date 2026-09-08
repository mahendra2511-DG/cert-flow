import { ExamCardSkeletonGrid } from "@/components/catalog/exam-card-skeleton";
import { PageContainer } from "@/components/layout/page-container";

export default function CertificationsLoading() {
  return (
    <PageContainer className="py-10">
      <SkeletonHeading />
      <div className="mt-8">
        <ExamCardSkeletonGrid count={6} />
      </div>
    </PageContainer>
  );
}

function SkeletonHeading() {
  return (
    <div className="space-y-3">
      <div className="bg-muted h-4 w-40 animate-pulse rounded" />
      <div className="bg-muted h-9 w-72 animate-pulse rounded" />
      <div className="bg-muted h-4 w-full max-w-xl animate-pulse rounded" />
    </div>
  );
}
