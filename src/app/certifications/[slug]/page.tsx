import Link from "next/link";
import { notFound } from "next/navigation";
import { PracticeTestCard } from "@/components/catalog/cards";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  certificationBySlug,
  providerBySlug,
  testsForCertification,
} from "@/lib/catalog/data";
import { createMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cert = certificationBySlug(slug);
  if (!cert) {
    return createMetadata({
      title: "Certification not found",
      description: "That certification is not in the PrepHarbor catalog.",
      path: `/certifications/${slug}`,
      noIndex: true,
    });
  }

  return createMetadata({
    title: `${cert.code} · ${cert.name}`,
    description: cert.summary,
    path: `/certifications/${cert.slug}`,
  });
}

export default async function CertificationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cert = certificationBySlug(slug);
  if (!cert) {
    notFound();
  }

  const provider = providerBySlug(cert.providerSlug);
  const tests = testsForCertification(cert.slug);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <p className="text-sm text-muted-foreground">
        <Link href="/certifications" className="hover:text-foreground">
          Certifications
        </Link>{" "}
        / {provider?.name}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge>{cert.code}</Badge>
        <Badge variant="secondary">{cert.level}</Badge>
        <Badge variant="outline">{cert.durationMin} min exam window</Badge>
      </div>
      <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">{cert.name}</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">{cert.description}</p>

      <div className="mt-8">
        <h2 className="text-xl font-semibold">Practice tests</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {tests.map((item) => (
            <PracticeTestCard key={item.slug} item={item} />
          ))}
        </div>
      </div>

      <Button
        nativeButton={false}
        render={<Link href="/practice-tests" />}
        variant="outline"
        className="mt-8"
      >
        Browse every practice test
      </Button>
    </div>
  );
}
