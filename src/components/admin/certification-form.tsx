import { saveCertificationAction } from "@/lib/admin/actions";
import { getVendorAdmin, type LiveVendor } from "@/lib/admin/catalog-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CertificationForm({ vendor }: { vendor?: LiveVendor | null }) {
  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">{vendor ? "Edit certification" : "Create certification"}</h1>
      <form action={saveCertificationAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required defaultValue={vendor?.name} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" name="slug" defaultValue={vendor?.slug} placeholder="auto from name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Short description</Label>
          <textarea
            id="description"
            name="description"
            required
            defaultValue={vendor?.description}
            className="min-h-24 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="longDescription">Long description</Label>
          <textarea
            id="longDescription"
            name="longDescription"
            defaultValue={vendor?.longDescription}
            className="min-h-28 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm"
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isPublished" defaultChecked={vendor?.isPublished ?? true} />
          Published
        </label>
        <Button type="submit">Save certification</Button>
      </form>
    </div>
  );
}

export function CertificationFormFromSlug({ slug }: { slug?: string }) {
  const vendor = slug ? getVendorAdmin(slug) : null;
  return <CertificationForm vendor={vendor} />;
}
