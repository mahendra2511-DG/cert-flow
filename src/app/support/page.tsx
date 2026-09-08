import Link from "next/link";
import { contentMetadata, ContentPage } from "@/components/layout/content-page";
import { route } from "@/lib/routes";

export const metadata = contentMetadata(
  "Support",
  "Help with sign-in, purchases, and taking a practice test.",
  "/support",
);

export default function SupportPage() {
  return (
    <ContentPage
      title="Help center"
      description="Sign-in, purchases, and exam-taking."
      path="/support"
    >
      <p>
        Demo account: <code>demo@prepharbor.test</code> / <code>demo</code>. Use it from the{" "}
        <Link href="/sign-in">log in</Link> page while the database is optional.
      </p>
      <p>
        If a purchase does not unlock after you pay, write to{" "}
        <Link href="/contact">contact</Link> with the order id from{" "}
        <Link href={route("/dashboard/orders")}>order history</Link>. Access is granted only after the server
        verifies the Razorpay payment signature.
      </p>
    </ContentPage>
  );
}
