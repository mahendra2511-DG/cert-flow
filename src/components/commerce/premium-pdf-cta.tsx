import Link from "next/link";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { userOwnsExam } from "@/lib/commerce/checkout";
import { route } from "@/lib/routes";

export async function PremiumPdfCta({
  vendor,
  exam,
  checkoutSlug,
}: {
  vendor: string;
  exam: string;
  checkoutSlug: string;
}) {
  const session = await auth();
  const owned = session?.user?.id ? await userOwnsExam(session.user.id, vendor, exam) : false;

  if (!owned) {
    return (
      <div className="rounded-2xl border bg-card p-5">
        <p className="text-sm font-medium">Premium PDF</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Purchase premium access to download. The file is never a public URL.
        </p>
        <Button nativeButton={false} className="mt-4" render={<Link href={route(`/checkout/${checkoutSlug}`)} />}>
          Unlock PDF
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-card p-5">
      <p className="text-sm font-medium">Download premium PDF</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Authorized for this account after a verified purchase.
      </p>
      <Button
        nativeButton={false}
        className="mt-4"
        render={<a href={`/api/premium-pdf/${vendor}__${exam}`} />}
      >
        Download premium PDF
      </Button>
    </div>
  );
}
