import type { Metadata } from "next";
import { requireStaff } from "@/lib/auth/session";
import { AdminNav } from "@/components/admin/admin-nav";
import { createMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createMetadata({
  title: "Admin",
  description: "Certiva marketplace administration.",
  path: "/admin",
  noIndex: true,
});

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireStaff();
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <p className="mb-3 hidden text-xs font-semibold tracking-wide text-muted-foreground uppercase lg:block">
            {user.role === "editor" ? "Editor" : "Admin"}
          </p>
          <AdminNav role={user.role} />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
