import { auth, signOut } from "@/auth";
import { EmptyState } from "@/components/ui-patterns/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Account",
  description: "Manage your PrepHarbor profile.",
  path: "/account",
  noIndex: true,
});

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <EmptyState
          title="Sign in to manage your account"
          description="Use the demo learner or connect PostgreSQL to persist real accounts."
          actionHref="/sign-in"
          actionLabel="Sign in"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold">Account</h1>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{session.user.name ?? "Learner"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p>
            Email: <span className="font-medium">{session.user.email}</span>
          </p>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <Button type="submit" variant="outline">
              Sign out
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
