import { contentMetadata, ContentPage } from "@/components/layout/content-page";

export const metadata = contentMetadata(
  "Terms",
  "Terms of use for the PrepHarbor practice-test marketplace.",
  "/terms",
);

export default function TermsPage() {
  return (
    <ContentPage
      title="Terms of use"
      description="Independent practice tests. Not official vendor exams."
      path="/terms"
    >
      <p>
        PrepHarbor sells access to original practice tests. Purchase grants a personal license to
        sit the online exam and review explanations. Redistributing questions is not allowed.
      </p>
      <p>
        PrepHarbor is not affiliated with Microsoft, Amazon, Google, Cisco, CompTIA, or the Cloud
        Native Computing Foundation. Passing a practice test does not confer a vendor credential.
      </p>
      <p>These terms are a foundation draft and will be reviewed by counsel before paid launch.</p>
    </ContentPage>
  );
}
