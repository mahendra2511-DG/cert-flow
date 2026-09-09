import { requireUser } from "@/lib/auth/session";
import { findUserById } from "@/lib/auth/user-store";
import { signOutAction } from "@/lib/auth/actions";
import { ProfileForms } from "@/components/dashboard/profile-forms";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Profile",
  description: "Manage your Certiva name, password, and account settings.",
  path: "/dashboard/profile",
  noIndex: true,
});

export default async function DashboardProfilePage() {
  const sessionUser = await requireUser();
  const user = await findUserById(sessionUser.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Profile</h1>
        <p className="mt-2 text-muted-foreground">
          Name, email, password, and notification preferences for this account.
        </p>
      </div>

      {user ? <ProfileForms user={user} /> : <p>We could not load this profile. Sign in again.</p>}

      <Card>
        <CardHeader>
          <CardTitle>Session</CardTitle>
          <CardDescription>
            Signing out ends this browser session. Your purchases stay on the account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={signOutAction}>
            <Button type="submit" variant="outline">
              Log out
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
