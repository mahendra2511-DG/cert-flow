import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SignInForm } from "@/components/auth/sign-in-form";
import { createMetadata } from "@/lib/seo";
import { route } from "@/lib/routes";

export const metadata = createMetadata({
  title: "Sign in",
  description: "Sign in to PrepHarbor to open your dashboard and purchased tests.",
  path: "/sign-in",
  noIndex: true,
});

function safeCallbackUrl(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return "/dashboard";
  }
  return raw;
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  const callbackUrl = safeCallbackUrl(params.callbackUrl);
  if (session?.user) {
    if (callbackUrl.startsWith("/admin") && session.user.role !== "admin") {
      redirect(route("/forbidden"));
    }
    redirect(route(callbackUrl));
  }
  return <SignInForm callbackUrl={callbackUrl} />;
}
