import Link from "next/link";
import { examContentOverview, listExamsAdmin, listVendorsAdmin } from "@/lib/admin/catalog-store";
import { getPremiumPdfAny } from "@/lib/pdf/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatInr } from "@/lib/format";
import { route } from "@/lib/routes";

export default function ExamPackagePage() {
  const vendors = listVendorsAdmin();
  const exams = listExamsAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Create exam package</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Connect free questions, the premium bank, the premium PDF, and price to one exam, then save.
        </p>
      </div>
      <div className="grid gap-4">
        {exams.map((exam) => {
          const overview = examContentOverview(exam.vendorSlug, exam.slug);
          const vendor = vendors.find((item) => item.slug === exam.vendorSlug);
          const pdf = getPremiumPdfAny(exam.vendorSlug, exam.slug);
          const ready =
            (overview?.freeQuestions ?? 0) > 0 &&
            (overview?.premiumQuestions ?? 0) > 0 &&
            Boolean(pdf);
          return (
            <Card key={`${exam.vendorSlug}/${exam.slug}`}>
              <CardHeader>
                <CardTitle>
                  {vendor?.name} · {exam.code}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>Free questions: {overview?.freeQuestions ?? 0} uploaded {overview && overview.freeQuestions >= 20 ? "✓" : ""}</p>
                <p>Premium questions: {overview?.premiumQuestions ?? 0} uploaded {overview && overview.premiumQuestions > 0 ? "✓" : ""}</p>
                <p>
                  Premium PDF: {pdf ? `${pdf.filename} ✓` : "Not uploaded"}
                </p>
                <p>Price: {formatInr(exam.tests[0]?.pricePaise ?? 0)}</p>
                <p>
                  Status:{" "}
                  <Badge variant={exam.isPublished ? "default" : "secondary"}>
                    {exam.isPublished ? "Published" : "Draft"}
                  </Badge>
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button
                    nativeButton={false}
                    size="sm"
                    render={<Link href={route(`/admin/exams/${exam.vendorSlug}/${exam.slug}/content`)} />}
                  >
                    {ready ? "Save / review package" : "Complete package"}
                  </Button>
                  <Button
                    nativeButton={false}
                    size="sm"
                    variant="outline"
                    render={<Link href={route(`/admin/questions?vendor=${exam.vendorSlug}&exam=${exam.slug}`)} />}
                  >
                    Questions
                  </Button>
                  <Button
                    nativeButton={false}
                    size="sm"
                    variant="outline"
                    render={<Link href={route("/admin/pdfs")} />}
                  >
                    PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
