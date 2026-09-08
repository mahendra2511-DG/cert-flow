import { Skeleton } from "@/components/ui/skeleton";

export default function PracticeTestLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="mt-4 h-10 w-96" />
      <div className="mt-8 grid gap-4 sm:grid-cols-4">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
      <Skeleton className="mt-8 h-64" />
    </div>
  );
}
