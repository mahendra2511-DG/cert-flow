import Link from "next/link";
import { EmptyState } from "@/components/ui-patterns/empty-state";
import { auth } from "@/auth";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "My library",
  description: "Practice tests you have purchased.",
  path: "/library",
  noIndex: true,
});

export default async function LibraryPage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <EmptyState
          title="Sign in to see purchased tests"
          description="Your library will list every practice test you buy, with a start-exam button."
          actionHref="/sign-in"
          actionLabel="Sign in"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold">My library</h1>
      <p className="mt-2 text-muted-foreground">
        Signed in as {session.user.email}. Purchases will appear here once checkout is connected to
        PostgreSQL.
      </p>
      <EmptyState
        title="No purchases yet"
        description="The catalog is available now. After you buy a test, it will show up in this list."
        actionHref="/practice-tests"
        actionLabel="Browse practice tests"
      />
      <p className="mt-6 text-sm">
        Preview the exam shell:{" "}
        <Link href="/exam/sample" className="font-medium text-primary hover:underline">
          Open sample exam
        </Link>
      </p>
    </div>
  );
}
