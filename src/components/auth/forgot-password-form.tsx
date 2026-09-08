"use client";

import Link from "next/link";
import { useState } from "react";
import { requestPasswordResetAction } from "@/lib/auth/actions";
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

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const result = await requestPasswordResetAction(formData);
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSent(true);
    setResetUrl(result.resetUrl ?? null);
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-16 sm:px-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-2xl">Forgot password</CardTitle>
          <CardDescription>
            Enter the email on your account. If it matches, we generate a one-hour reset link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="space-y-4 text-sm">
              <p>
                If an account exists for that address, a reset link is ready. Mail delivery is not
                configured in this environment, so a working link is shown below when the account
                was found.
              </p>
              {resetUrl ? (
                <p className="rounded-xl bg-muted/60 p-3 break-all">
                  <a href={resetUrl} className="font-medium text-primary hover:underline">
                    {resetUrl}
                  </a>
                </p>
              ) : (
                <p className="text-muted-foreground">No matching account was found for that email.</p>
              )}
              <Link href="/sign-in" className="font-medium text-foreground hover:underline">
                Back to sign in
              </Link>
            </div>
          ) : (
            <form action={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" autoComplete="email" required />
              </div>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? "Checking…" : "Send reset link"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                <Link href="/sign-in" className="font-medium text-foreground hover:underline">
                  Back to sign in
                </Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
