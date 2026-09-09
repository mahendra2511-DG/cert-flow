import { redirect } from "next/navigation";
import { route } from "@/lib/routes";

export default async function LegacyEditTestPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(route(`/admin/papers/${slug}`));
}
