import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/session";
import { DashboardNav } from "@/components/dashboard/nav";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Dashboard",
  description: "Your PrepHarbor practice tests, attempts, and account.",
  path: "/dashboard",
  noIndex: true,
});

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireUser();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <p className="mb-3 hidden text-xs font-semibold tracking-wide text-muted-foreground uppercase lg:block">
            Study hub
          </p>
          <DashboardNav />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
