import Link from "next/link";
import { EmptyState } from "@/components/ui-patterns/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listVendorsAdmin } from "@/lib/admin/catalog-store";
import { deleteCertificationAction, toggleCertificationAction } from "@/lib/admin/actions";
import { ConfirmForm } from "@/components/ui/confirm-form";
import { route } from "@/lib/routes";

export default function AdminCertificationsPage() {
  const vendors = listVendorsAdmin();
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Certifications</h1>
          <p className="mt-2 text-muted-foreground">Vendors in the public catalog. Unpublished vendors hide their exams.</p>
        </div>
        <Button nativeButton={false} render={<Link href={route("/admin/certifications/new")} />}>
          Create certification
        </Button>
      </div>
      {vendors.length === 0 ? (
        <EmptyState
          title="No certifications"
          description="Create a vendor to attach exams and practice tests."
          actionHref={route("/admin/certifications/new")}
          actionLabel="Create certification"
        />
      ) : (
      <ul className="space-y-3">
        {vendors.map((vendor) => (
          <li key={vendor.slug} className="rounded-2xl border p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold">{vendor.name}</h2>
                  <Badge variant={vendor.isPublished ? "default" : "secondary"}>
                    {vendor.isPublished ? "Published" : "Unpublished"}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{vendor.description}</p>
                <p className="mt-1 font-mono text-xs text-muted-foreground">{vendor.slug}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  nativeButton={false}
                  size="sm"
                  variant="outline"
                  render={<Link href={route(`/admin/certifications/${vendor.slug}`)} />}
                >
                  Edit
                </Button>
                <form action={toggleCertificationAction}>
                  <input type="hidden" name="slug" value={vendor.slug} />
                  <Button type="submit" size="sm" variant="secondary">
                    {vendor.isPublished ? "Unpublish" : "Publish"}
                  </Button>
                </form>
                <ConfirmForm
                  action={deleteCertificationAction}
                  title="Delete this certification?"
                  description="Exams and questions under this vendor will be removed from the live catalog."
                  confirmLabel="Delete"
                >
                  <input type="hidden" name="slug" value={vendor.slug} />
                  <Button type="submit" size="sm" variant="destructive">
                    Delete
                  </Button>
                </ConfirmForm>
              </div>
            </div>
          </li>
        ))}
      </ul>
      )}
    </div>
  );
}
