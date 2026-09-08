import { Skeleton } from "@/components/ui/skeleton";

export function ExamCardSkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2" aria-busy="true">
      {Array.from({ length: count }, (_, index) => (
        <Skeleton key={index} className="h-64 rounded-xl" />
      ))}
    </div>
  );
}
