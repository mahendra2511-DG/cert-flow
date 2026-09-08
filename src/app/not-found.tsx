import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Page not found",
  description: "That PrepHarbor URL is not in the catalog.",
  path: "/404",
  noIndex: true,
});

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center px-4 py-20 text-center">
      <p className="text-sm font-medium text-primary">404</p>
      <h1 className="mt-2 text-3xl font-semibold">Page not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        That route is not in PrepHarbor. Head back to the catalog to keep studying.
      </p>
      <Button nativeButton={false} render={<Link href="/" />} className="mt-6">
        Go home
      </Button>
    </div>
  );
}
