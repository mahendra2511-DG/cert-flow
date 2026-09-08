"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  changePasswordAction,
  updateAccountSettingsAction,
  updateProfileAction,
} from "@/lib/auth/actions";
import type { StoredUser } from "@/lib/auth/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ProfileForms({ user }: { user: StoredUser }) {
  return (
    <div className="space-y-6">
      <ProfileDetails user={user} />
      <PasswordForm />
      <AccountSettings user={user} />
    </div>
  );
}

function ProfileDetails({ user }: { user: StoredUser }) {
  const { update } = useSession();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    setMessage(null);
    const result = await updateProfileAction(formData);
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.name) {
      await update({ name: result.name });
    }
    setMessage("Profile saved.");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Name and email</CardTitle>
        <CardDescription>Your name appears on the dashboard welcome and on receipts.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" defaultValue={user.name} autoComplete="name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user.email} readOnly disabled />
            <p className="text-xs text-muted-foreground">
              Email is used to sign in and cannot be changed from this screen.
            </p>
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function PasswordForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    setMessage(null);
    const result = await changePasswordAction(formData);
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setMessage("Password updated. Use the new password next time you sign in.");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change password</CardTitle>
        <CardDescription>Sessions stay signed in. New devices will need the new password.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current password</Label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New password</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
          <Button type="submit" disabled={pending}>
            {pending ? "Updating…" : "Update password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function AccountSettings({ user }: { user: StoredUser }) {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setMessage(null);
    await updateAccountSettingsAction(formData);
    setPending(false);
    setMessage("Preferences saved.");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account settings</CardTitle>
        <CardDescription>Control study emails. You can change these anytime.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={onSubmit} className="space-y-4">
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              name="notifyProductUpdates"
              defaultChecked={user.notifyProductUpdates}
              className="mt-1 size-4 rounded border"
            />
            <span>
              <span className="font-medium">Product updates</span>
              <span className="block text-muted-foreground">
                Occasional notes when we add exams or change how sittings work.
              </span>
            </span>
          </label>
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              name="notifyAttemptSummaries"
              defaultChecked={user.notifyAttemptSummaries}
              className="mt-1 size-4 rounded border"
            />
            <span>
              <span className="font-medium">Attempt summaries</span>
              <span className="block text-muted-foreground">
                A short recap after you submit a timed test.
              </span>
            </span>
          </label>
          {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save settings"}
          </Button>
        </form>
        <div className="mt-6 rounded-xl border border-dashed p-4 text-sm">
          <p className="font-medium">Close this account</p>
          <p className="mt-1 text-muted-foreground">
            Email support@prepharbor.test from this address if you want purchases and attempts
            removed. We do not silently delete paid access from this page.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
