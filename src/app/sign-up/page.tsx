import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { createMetadata } from "@/lib/seo";
import { route } from "@/lib/routes";

export const metadata = createMetadata({
  title: "Sign up",
  description: "Create a PrepHarbor account to save purchases and attempts.",
  path: "/sign-up",
  noIndex: true,
});

export default async function SignUpPage() {
  const session = await auth();
  if (session?.user) {
    redirect(route("/dashboard"));
  }
  return <SignUpForm />;
}
