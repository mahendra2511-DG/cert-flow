import Link from "next/link";
import type { Route } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ProviderMark } from "@/components/brand/provider-mark";
import { StarRating } from "@/components/catalog/star-rating";
import type { ExamListing } from "@/lib/catalog/repository";
import { formatInrFromPaise } from "@/lib/utils";

export function ExamCard({ exam }: { exam: ExamListing }) {
  return (
    <Card className="h-full transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ProviderMark slug={exam.vendorSlug} name={exam.vendorName} className="size-9 text-[10px]" />
            <span className="text-xs font-medium text-muted-foreground">{exam.vendorName}</span>
          </div>
          <Badge variant="secondary">{exam.code}</Badge>
        </div>
        <CardTitle className="font-heading text-lg leading-snug">
          <Link href={exam.href as Route} className="hover:underline">
            {exam.name}
          </Link>
        </CardTitle>
        <StarRating value={exam.ratingAverage} count={exam.ratingCount} />
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground">{exam.summary}</p>
        <p className="text-sm">
          <span className="font-medium">{exam.freeQuestionCount} free</span>
          <span className="text-muted-foreground">
            {" "}
            · {exam.premiumQuestionCount} premium · {exam.questionCount} total
          </span>
        </p>
        <p className="text-xl font-semibold">{formatInrFromPaise(exam.pricePaise)}</p>
      </CardContent>
      <CardFooter>
        <Button nativeButton={false} render={<Link href={exam.href as Route} />} className="w-full">
          View exam
        </Button>
      </CardFooter>
    </Card>
  );
}
