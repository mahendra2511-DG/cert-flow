import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createMetadata } from "@/lib/seo";
import { route } from "@/lib/routes";

export const metadata = createMetadata({
  title: "Access denied",
  description: "This area is limited to PrepHarbor administrators.",
  path: "/forbidden",
  noIndex: true,
});

export default function ForbiddenPage() {
  return (
    <div className="mx-auto w-full max-w-lg px-4 py-20 text-center sm:px-6">
      <p className="text-sm font-medium text-muted-foreground">403</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Admin only</h1>
      <p className="mt-3 text-muted-foreground">
        This account is signed in as a learner. Marketplace administration is limited to staff
        accounts. Return to the catalog or your dashboard.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <Button nativeButton={false} render={<Link href={route("/dashboard")} />}>
          Open dashboard
        </Button>
        <Button nativeButton={false} variant="outline" render={<Link href={route("/certifications")} />}>
          Browse exams
        </Button>
      </div>
    </div>
  );
}
