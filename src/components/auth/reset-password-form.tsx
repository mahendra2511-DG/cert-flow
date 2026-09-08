"use client";

import Link from "next/link";
import { useState } from "react";
import { resetPasswordAction } from "@/lib/auth/actions";
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
import { route } from "@/lib/routes";

export function ResetPasswordForm({ token }: { token: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const result = await resetPasswordAction(formData);
    setPending(false);
    if (result?.error) {
      setError(result.error);
    }
  }

  if (!token) {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-16 sm:px-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-2xl">Reset password</CardTitle>
            <CardDescription>This page needs a valid token from a reset email or demo inbox link.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={route("/forgot-password")} className="text-sm font-medium hover:underline">
              Request a new link
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-16 sm:px-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-2xl">Choose a new password</CardTitle>
          <CardDescription>The link expires after one hour. You will be signed in after a successful reset.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={onSubmit} className="space-y-4">
            <input type="hidden" name="token" value={token} />
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm password</Label>
              <Input
                id="confirm"
                name="confirm"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Updating…" : "Reset password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
