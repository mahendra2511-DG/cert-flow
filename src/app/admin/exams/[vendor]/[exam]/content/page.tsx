import Link from "next/link";
import { notFound } from "next/navigation";
import { examContentOverview } from "@/lib/admin/catalog-store";
import { getPremiumPdfAny } from "@/lib/pdf/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import { route } from "@/lib/routes";

export default async function ExamContentDashboardPage({
  params,
}: {
  params: Promise<{ vendor: string; exam: string }>;
}) {
  const { vendor, exam } = await params;
  const overview = examContentOverview(vendor, exam);
  if (!overview) {
    notFound();
  }
  const pdf = getPremiumPdfAny(vendor, exam);
  const qs = new URLSearchParams({ vendor, exam });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          {overview.vendor?.name} / {overview.exam.code}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Content overview</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>CONTENT OVERVIEW</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
          <p>Free Questions {overview.freeQuestions}</p>
          <p>Premium Questions {overview.premiumQuestions}</p>
          <p>Total Questions {overview.totalQuestions}</p>
          <p>Published questions {overview.publishedQuestions}</p>
          <p>Draft questions {overview.draftQuestions}</p>
          <p>Free Papers {overview.freePapers}</p>
          <p>Premium Papers {overview.premiumPapers}</p>
          <p>Premium PDF {pdf ? "✓" : "—"}</p>
          <p>
            Published{" "}
            <Badge variant={overview.published ? "default" : "secondary"}>
              {overview.published ? "✓" : "Draft"}
            </Badge>
          </p>
          <p>Last Updated {formatDate(overview.lastUpdated)}</p>
          <p>Version v{overview.contentVersion}</p>
        </CardContent>
      </Card>
      <div className="flex flex-wrap gap-2">
        <Button nativeButton={false} render={<Link href={route(`/admin/questions?${qs}`)} />}>
          Manage Questions
        </Button>
        <Button nativeButton={false} variant="outline" render={<Link href={route(`/admin/papers?${qs}`)} />}>
          Manage Papers
        </Button>
        <Button nativeButton={false} variant="outline" render={<Link href={route("/admin/pdfs")} />}>
          Upload PDF
        </Button>
        <Button
          nativeButton={false}
          variant="outline"
          render={<Link href={route(`/admin/exams/${vendor}/${exam}`)} />}
        >
          Edit Exam
        </Button>
        <Button
          nativeButton={false}
          variant="secondary"
          render={<Link href={route(`/certifications/${vendor}/${exam}`)} />}
        >
          Preview Exam
        </Button>
      </div>
    </div>
  );
}
