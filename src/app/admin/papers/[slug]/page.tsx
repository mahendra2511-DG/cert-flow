import { notFound } from "next/navigation";
import { TestForm } from "@/components/admin/test-form";
import { getTestAdmin } from "@/lib/admin/catalog-store";

export default async function EditPaperPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!getTestAdmin(slug)) {
    notFound();
  }
  return <TestForm testSlug={slug} />;
}
