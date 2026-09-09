import { contentMetadata, ContentPage } from "@/components/layout/content-page";

export const metadata = contentMetadata(
  "Contact",
  "Reach the Certiva team about catalog, billing, or account access.",
  "/contact",
);

export default function ContactPage() {
  return (
    <ContentPage
      title="Contact"
      description="Catalog questions, billing, and account access."
      path="/contact"
    >
      <p>
        Email <a href="mailto:hello@prepharbor.example">hello@prepharbor.example</a> for catalog or
        billing help. Include your account email and the exam code if the issue is about a purchase.
      </p>
      <p>
        This marketplace currently uses a demo sign-in while PostgreSQL and Razorpay are being
        connected. Do not send live card details over email.
      </p>
    </ContentPage>
  );
}
