"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ADMIN_EMAIL, ADMIN_PASSWORD, DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/auth/types";
import { route } from "@/lib/routes";

export function SignInForm({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const result = await signIn("credentials", {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      redirect: false,
      callbackUrl,
    });
    setPending(false);

    if (result?.error) {
      setError("Those credentials did not match. Check the email and password, or use the demo account.");
      return;
    }

    router.push(route(callbackUrl));
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-16 sm:px-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-2xl">Sign in</CardTitle>
          <CardDescription>
            Demo learner: {DEMO_EMAIL} / {DEMO_PASSWORD}. Admin: {ADMIN_EMAIL} / {ADMIN_PASSWORD}.
            New learner accounts cannot open /admin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                defaultValue={DEMO_EMAIL}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                defaultValue={DEMO_PASSWORD}
                required
              />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Signing in…" : "Continue"}
            </Button>
            <p className="text-center text-sm">
              <Link href={route("/forgot-password")} className="font-medium text-foreground hover:underline">
                Forgot password?
              </Link>
            </p>
            <p className="text-center text-sm text-muted-foreground">
              Need an account?{" "}
              <Link href="/sign-up" className="font-medium text-foreground hover:underline">
                Sign up
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
