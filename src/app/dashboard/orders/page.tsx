import Link from "next/link";
import type { Route } from "next";
import { requireUser } from "@/lib/auth/session";
import { listOrdersForUser } from "@/lib/commerce/order-store";
import { formatDate, formatInr } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui-patterns/empty-state";
import type { PaymentStatus } from "@/lib/commerce/types";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Orders",
  description: "Order history, payment status, and receipts.",
  path: "/dashboard/orders",
  noIndex: true,
});

function statusVariant(status: PaymentStatus) {
  if (status === "PAID") {
    return "default" as const;
  }
  if (status === "PENDING") {
    return "secondary" as const;
  }
  if (status === "CANCELLED") {
    return "outline" as const;
  }
  return "destructive" as const;
}

export default async function DashboardOrdersPage() {
  const user = await requireUser();
  const orders = await listOrdersForUser(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Orders</h1>
        <p className="mt-2 text-muted-foreground">
          Order ID, product, amount, payment status, and a receipt you can print.
        </p>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="When you buy a practice test, the receipt and invoice number show up here."
          actionHref="/practice-tests"
          actionLabel="Browse practice tests"
        />
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-2xl border md:block">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-muted/50 text-xs tracking-wide text-muted-foreground uppercase">
                <tr>
                  <th className="px-4 py-3 font-medium">Order ID</th>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Payment</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Invoice</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-t">
                    <td className="px-4 py-3 font-mono text-xs">{order.id}</td>
                    <td className="px-4 py-3">
                      {order.items.map((item) => item.testName).join(", ")}
                    </td>
                    <td className="px-4 py-3">{formatInr(order.amountPaise)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant(order.status)}>{order.status}</Badge>
                    </td>
                    <td className="px-4 py-3">{formatDate(order.createdAt)}</td>
                    <td className="px-4 py-3">
                      <Button
                        nativeButton={false}
                        size="sm"
                        variant="outline"
                        render={<Link href={`/dashboard/orders/${order.id}` as Route} />}
                      >
                        Receipt
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="space-y-3 md:hidden">
            {orders.map((order) => (
              <li key={order.id} className="rounded-2xl border p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-mono text-xs">{order.id}</p>
                  <Badge variant={statusVariant(order.status)}>{order.status}</Badge>
                </div>
                <p className="mt-2 font-medium">{order.items.map((item) => item.testName).join(", ")}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatInr(order.amountPaise)} · {formatDate(order.createdAt)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Invoice {order.invoiceNumber}</p>
                <Button
                  nativeButton={false}
                  className="mt-3 w-full"
                  variant="outline"
                  render={<Link href={`/dashboard/orders/${order.id}` as Route} />}
                >
                  View receipt
                </Button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
