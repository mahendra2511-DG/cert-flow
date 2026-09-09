import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Reset password",
  description: "Choose a new Certiva password.",
  path: "/reset-password",
  noIndex: true,
});

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return <ResetPasswordForm token={token ?? ""} />;
}
