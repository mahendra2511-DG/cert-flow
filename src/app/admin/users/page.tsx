import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui-patterns/empty-state";
import { updateRoleAction } from "@/lib/admin/actions";
import { listUsers } from "@/lib/auth/user-store";
import { formatDate } from "@/lib/format";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const users = await listUsers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Users</h1>
        <p className="mt-2 text-muted-foreground">
          Promote or demote accounts. Learners never receive admin navigation or API access.
        </p>
      </div>
      {error === "last-admin" ? (
        <p className="text-sm text-destructive">Keep at least one admin account.</p>
      ) : null}
      {users.length === 0 ? (
        <EmptyState title="No users" description="Accounts created from sign-up will appear here." />
      ) : (
        <ul className="space-y-3">
          {users.map((user) => (
            <li key={user.id} className="flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{user.name}</p>
                  <Badge variant={user.role === "admin" ? "default" : "outline"}>{user.role}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <p className="text-xs text-muted-foreground">Joined {formatDate(user.createdAt)}</p>
              </div>
              <form action={updateRoleAction} className="flex flex-wrap items-center gap-2">
                <input type="hidden" name="id" value={user.id} />
                <select
                  name="role"
                  defaultValue={user.role}
                  className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
                >
                  <option value="learner">learner</option>
                  <option value="admin">admin</option>
                </select>
                <Button type="submit" size="sm" variant="secondary">
                  Update role
                </Button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
