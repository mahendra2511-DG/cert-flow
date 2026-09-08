import Link from "next/link";
import { contentMetadata, ContentPage } from "@/components/layout/content-page";

export const metadata = contentMetadata(
  "Privacy",
  "How PrepHarbor handles account and payment information.",
  "/privacy",
);

export default function PrivacyPage() {
  return (
    <ContentPage
      title="Privacy"
      description="How PrepHarbor handles account and payment information."
      path="/privacy"
    >
      <p>
        PrepHarbor stores the email and name you use to sign in, purchase records, and exam
        attempts. Payment card data is processed by Razorpay and is not stored on PrepHarbor
        servers.
      </p>
      <p>
        We do not sell learner data. Session cookies are used only to keep you signed in. For
        questions, use the <Link href="/contact">contact</Link> page.
      </p>
      <p>This page is a launch placeholder and will be replaced with a full policy before public billing.</p>
    </ContentPage>
  );
}
