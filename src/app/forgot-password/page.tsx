import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Forgot password",
  description: "Reset your Certiva password.",
  path: "/forgot-password",
  noIndex: true,
});

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
