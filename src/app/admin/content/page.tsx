import Link from "next/link";
import { examContentOverview, listExamsAdmin, listVendorsAdmin } from "@/lib/admin/catalog-store";
import { getPremiumPdfAny } from "@/lib/pdf/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatInr } from "@/lib/format";
import { route } from "@/lib/routes";

export default function AdminContentPage() {
  const vendors = listVendorsAdmin();
  const exams = listExamsAdmin();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Content management</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Provider → exam → content type → upload → preview → validate → publish. The live catalog
            is database-driven. Adding AWS SAA-C03 tomorrow does not require a code change.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button nativeButton={false} variant="outline" render={<Link href={route("/admin/content/package")} />}>
            Create exam package
          </Button>
          <Button nativeButton={false} render={<Link href={route("/admin/content/wizard")} />}>
            + Add new exam
          </Button>
        </div>
      </div>

      <ol className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          "Select provider",
          "Select exam",
          "Select content type",
          "Upload / add",
          "Preview & validate",
          "Publish",
        ].map((step, index) => (
          <li key={step} className="rounded-2xl border bg-card px-3 py-3 text-sm">
            <p className="text-xs font-semibold text-muted-foreground">Step {index + 1}</p>
            <p className="mt-1 font-medium">{step}</p>
          </li>
        ))}
      </ol>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <HubCard href="/admin/questions?tier=free" title="Free 20 questions" body="Choose which questions are free. Default cap is 20." />
        <HubCard href="/admin/questions?tier=premium" title="Premium questions" body="Question 21 onwards stays locked until purchase." />
        <HubCard href="/admin/pdfs" title="Premium PDF" body="Private storage. Download only after verified payment." />
        <HubCard href="/admin/papers" title="Practice papers" body="Free or premium sittings with random, fixed, or category picks." />
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Exam content overview</h2>
        <div className="overflow-x-auto rounded-2xl border">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead className="bg-muted/50 text-xs tracking-wide text-muted-foreground uppercase">
              <tr>
                <th className="px-3 py-2 font-medium">Exam</th>
                <th className="px-3 py-2 font-medium">Free</th>
                <th className="px-3 py-2 font-medium">Premium</th>
                <th className="px-3 py-2 font-medium">Total</th>
                <th className="px-3 py-2 font-medium">Papers</th>
                <th className="px-3 py-2 font-medium">PDF</th>
                <th className="px-3 py-2 font-medium">Price</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {exams.map((exam) => {
                const overview = examContentOverview(exam.vendorSlug, exam.slug);
                const vendor = vendors.find((item) => item.slug === exam.vendorSlug);
                const pdf = getPremiumPdfAny(exam.vendorSlug, exam.slug);
                return (
                  <tr key={`${exam.vendorSlug}/${exam.slug}`} className="border-t">
                    <td className="px-3 py-2">
                      <p className="font-medium">
                        {vendor?.name} / {exam.code}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Updated {overview ? formatDate(overview.lastUpdated) : "—"} · v{exam.contentVersion}
                      </p>
                    </td>
                    <td className="px-3 py-2">{overview?.freeQuestions ?? 0}</td>
                    <td className="px-3 py-2">{overview?.premiumQuestions ?? 0}</td>
                    <td className="px-3 py-2">{overview?.totalQuestions ?? 0}</td>
                    <td className="px-3 py-2">
                      {overview?.freePapers ?? 0} free / {overview?.premiumPapers ?? 0} premium
                    </td>
                    <td className="px-3 py-2">{pdf?.status === "published" ? "✓" : pdf ? "Draft" : "—"}</td>
                    <td className="px-3 py-2">{formatInr(exam.tests[0]?.pricePaise ?? 0)}</td>
                    <td className="px-3 py-2">
                      <Badge variant={exam.isPublished ? "default" : "secondary"}>
                        {exam.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Button
                        nativeButton={false}
                        size="sm"
                        variant="outline"
                        render={<Link href={route(`/admin/exams/${exam.vendorSlug}/${exam.slug}/content`)} />}
                      >
                        Open
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function HubCard({ href, title, body }: { href: string; title: string; body: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{body}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button nativeButton={false} size="sm" variant="secondary" render={<Link href={route(href)} />}>
          Manage
        </Button>
      </CardContent>
    </Card>
  );
}
