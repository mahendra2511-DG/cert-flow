import Link from "next/link";
import type { Route } from "next";
import { Button } from "@/components/ui/button";

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref?: Route;
  actionLabel?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed bg-muted/30 px-6 py-14 text-center">
      <h2 className="font-heading text-xl font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      {actionHref && actionLabel ? (
        <Button nativeButton={false} render={<Link href={actionHref} />} className="mt-6">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
