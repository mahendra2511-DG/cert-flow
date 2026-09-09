import { contentMetadata, ContentPage } from "@/components/layout/content-page";

export const metadata = contentMetadata(
  "Refund Policy",
  "How Certiva handles refunds for digital practice tests.",
  "/refund",
);

export default function RefundPage() {
  return (
    <ContentPage
      title="Refund policy"
      description="Digital practice access is granted immediately after a verified payment."
      path="/refund"
    >
      <p>
        Premium access is a digital product. If checkout succeeds and the signature verifies, the
        exam unlocks on your account right away, including premium questions and the PDF download.
      </p>
      <p>
        If a payment is captured twice or Razorpay reports a failure after a pending order, contact
        support with the order id from your dashboard. Duplicate purchases are blocked; we do not
        charge again for an exam you already own.
      </p>
      <p>This policy is a foundation draft and will be reviewed by counsel before paid launch.</p>
    </ContentPage>
  );
}
