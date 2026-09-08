import { notFound, permanentRedirect } from "next/navigation";
import { findLivePracticeTest, vendorIsPublic } from "@/lib/admin/catalog-store";
import { route } from "@/lib/routes";
import { createMetadata, practiceTestPath } from "@/lib/seo";

function publicTest(slug: string) {
  const catalog = findLivePracticeTest(slug);
  if (
    !catalog ||
    !catalog.exam.isPublished ||
    !catalog.test.isPublished ||
    !vendorIsPublic(catalog.vendorSlug)
  ) {
    return null;
  }
  return catalog;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const catalog = publicTest(slug);
  if (!catalog) {
    return createMetadata({
      title: "Practice test not found",
      description: "That practice test is not in the catalog.",
      path: `/practice-tests/${slug}`,
      noIndex: true,
    });
  }
  const path = practiceTestPath(catalog.vendorSlug, catalog.exam.slug);
  return createMetadata({
    title: catalog.test.title,
    description: catalog.test.summary,
    path: `/practice-tests/${slug}`,
    canonicalPath: path,
    noIndex: true,
  });
}

export default async function PracticeTestSlugRedirectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const catalog = publicTest(slug);
  if (!catalog) {
    notFound();
  }
  permanentRedirect(route(practiceTestPath(catalog.vendorSlug, catalog.exam.slug)));
}
