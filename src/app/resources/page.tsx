import Link from "next/link";
import { contentMetadata, ContentPage } from "@/components/layout/content-page";

export const metadata = contentMetadata(
  "Resources",
  "How to use Certiva practice tests alongside official vendor documentation.",
  "/resources",
);

export default function ResourcesPage() {
  return (
    <ContentPage
      title="Study resources"
      description="Pair timed practice with the vendor’s public skill outline."
      path="/resources"
    >
      <p>
        Certiva is for sitting exams and reviewing misses. Read the official outline for the
        credential you want, then use a Certiva test to check whether you can apply it under
        time.
      </p>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <Link href="/#how-it-works" className="text-foreground underline-offset-4 hover:underline">
            How a Certiva sitting works
          </Link>
        </li>
        <li>
          <Link href="/#faq" className="text-foreground underline-offset-4 hover:underline">
            Common questions before purchase
          </Link>
        </li>
        <li>
          <Link href="/practice-tests" className="text-foreground underline-offset-4 hover:underline">
            Current practice-test catalog
          </Link>
        </li>
      </ul>
    </ContentPage>
  );
}
