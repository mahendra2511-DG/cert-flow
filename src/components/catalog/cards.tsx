import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StarRating } from "@/components/catalog/star-rating";
import type { CatalogCertification, CatalogPracticeTest } from "@/lib/catalog/types";
import { certifications, providerBySlug } from "@/lib/catalog/data";
import { examPath } from "@/lib/catalog/seed-catalog";
import type { Route } from "next";
import { formatInrFromPaise } from "@/lib/utils";

export function CertificationCard({ item }: { item: CatalogCertification }) {
  const provider = providerBySlug(item.providerSlug);

  return (
    <Link href={examPath(item.providerSlug, item.slug) as Route} className="block h-full">
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <Badge variant="secondary">{item.code}</Badge>
            <span className="text-xs text-muted-foreground">{item.level}</span>
          </div>
          <CardTitle className="font-heading text-lg">{item.name}</CardTitle>
          <CardDescription>{provider?.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{item.summary}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

export function PracticeTestCard({ item }: { item: CatalogPracticeTest }) {
  const cert = certifications.find((c) => c.slug === item.certificationSlug);

  return (
    <Link href={`/practice-tests/${item.slug}`} className="block h-full">
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader>
          <Badge variant="outline">{cert?.code ?? "Exam"}</Badge>
          <CardTitle className="font-heading text-lg">{item.title}</CardTitle>
          <CardDescription>
            {item.questionCount} questions · {item.timeLimitMin} min
          </CardDescription>
          <StarRating value={item.ratingAverage} count={item.ratingCount} />
        </CardHeader>
        <CardContent className="flex items-end justify-between gap-3">
          <p className="text-sm text-muted-foreground">{item.summary}</p>
          <p className="shrink-0 font-semibold">{formatInrFromPaise(item.pricePaise)}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
