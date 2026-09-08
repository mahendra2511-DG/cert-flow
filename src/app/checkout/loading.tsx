import { Skeleton } from "@/components/ui/skeleton";

export default function CheckoutLoading() {
  return (
    <div className="mx-auto w-full max-w-lg px-4 py-16">
      <Skeleton className="h-9 w-40" />
      <Skeleton className="mt-4 h-24" />
      <Skeleton className="mt-6 h-10 w-full" />
    </div>
  );
}
