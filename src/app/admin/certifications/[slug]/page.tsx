import { notFound } from "next/navigation";
import { CertificationForm } from "@/components/admin/certification-form";
import { getVendorAdmin } from "@/lib/admin/catalog-store";

export default async function EditCertificationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const vendor = getVendorAdmin(slug);
  if (!vendor) {
    notFound();
  }
  return <CertificationForm vendor={vendor} />;
}
