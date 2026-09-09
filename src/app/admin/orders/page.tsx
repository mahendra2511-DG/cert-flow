import { requireAdmin } from "@/lib/auth/session";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui-patterns/empty-state";
import { listAllOrders } from "@/lib/commerce/order-store";
import { listUsers } from "@/lib/auth/user-store";
import { formatDate, formatInr } from "@/lib/format";

export default async function AdminOrdersPage() {
  await requireAdmin();
  const [orders, users] = await Promise.all([listAllOrders(), listUsers()]);
  const names = new Map(users.map((user) => [user.id, user]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Orders</h1>
        <p className="mt-2 text-muted-foreground">Checkout attempts, receipts, and payment status.</p>
      </div>
      {orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="Paid and pending checkouts will appear here after a learner completes Razorpay or local test checkout."
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-muted/50 text-xs tracking-wide text-muted-foreground uppercase">
              <tr>
                <th className="px-3 py-2 font-medium">Order</th>
                <th className="px-3 py-2 font-medium">Buyer</th>
                <th className="px-3 py-2 font-medium">Items</th>
                <th className="px-3 py-2 font-medium">Amount</th>
                <th className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const user = names.get(order.userId);
                return (
                  <tr key={order.id} className="border-t align-top">
                    <td className="px-3 py-2">
                      <p className="font-mono text-xs">{order.id}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                    </td>
                    <td className="px-3 py-2">
                      <p>{user?.name ?? order.userId}</p>
                      <p className="text-xs text-muted-foreground">{user?.email ?? "Unknown account"}</p>
                    </td>
                    <td className="px-3 py-2">{order.items.map((item) => item.testName).join(", ")}</td>
                    <td className="px-3 py-2">{formatInr(order.amountPaise)}</td>
                    <td className="px-3 py-2">
                      <Badge variant={order.status === "PAID" ? "default" : "secondary"}>{order.status}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
