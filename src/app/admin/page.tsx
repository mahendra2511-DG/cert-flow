import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { listUsers } from "@/lib/auth/user-store";
import { countAllQuestions, listExamsAdmin } from "@/lib/admin/catalog-store";
import { listAllOrders } from "@/lib/commerce/order-store";
import { formatDate, formatInr } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { route } from "@/lib/routes";

export default async function AdminHomePage() {
  await requireAdmin();
  const [users, orders] = await Promise.all([listUsers(), listAllOrders()]);
  const exams = listExamsAdmin();
  const paid = orders.filter((order) => order.status === "PAID");
  const sales = paid.reduce((sum, order) => sum + order.amountPaise, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Admin dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Catalog, questions, orders, and accounts. Learner sessions cannot open these routes.
        </p>
      </div>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Total users" value={String(users.length)} />
        <Stat label="Total exams" value={String(exams.length)} />
        <Stat label="Total questions" value={String(countAllQuestions())} />
        <Stat label="Total sales" value={formatInr(sales)} hint={`${paid.length} paid orders`} />
      </section>
      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle>Recent orders</CardTitle>
              <CardDescription>Latest checkout attempts and receipts.</CardDescription>
            </div>
            <Button nativeButton={false} size="sm" variant="ghost" render={<Link href={route("/admin/orders")} />}>
              View all
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {orders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No orders yet.</p>
            ) : (
              orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-start justify-between gap-3 rounded-xl border px-3 py-2 text-sm">
                  <div>
                    <p className="font-medium">{order.items.map((item) => item.testName).join(", ")}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.id} · {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <Badge variant={order.status === "PAID" ? "default" : "secondary"}>{order.status}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle>Recent users</CardTitle>
              <CardDescription>Newest accounts on this environment.</CardDescription>
            </div>
            <Button nativeButton={false} size="sm" variant="ghost" render={<Link href={route("/admin/users")} />}>
              View all
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {users.length === 0 ? (
              <p className="text-sm text-muted-foreground">No accounts yet.</p>
            ) : (
              users.slice(0, 5).map((user) => (
                <div key={user.id} className="flex items-start justify-between gap-3 rounded-xl border px-3 py-2 text-sm">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <Badge variant={user.role === "admin" ? "default" : "outline"}>{user.role}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl">{value}</CardTitle>
      </CardHeader>
      {hint ? (
        <CardContent>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </CardContent>
      ) : null}
    </Card>
  );
}
