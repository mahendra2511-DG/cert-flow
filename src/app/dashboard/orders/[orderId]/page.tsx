import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { getOrderForUser } from "@/lib/commerce/order-store";
import { formatDateTime, formatInr } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PrintReceiptButton } from "@/components/dashboard/print-receipt-button";
import { route } from "@/lib/routes";

export default async function OrderReceiptPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const user = await requireUser();
  const { orderId } = await params;
  const order = await getOrderForUser(user.id, orderId);
  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <Button nativeButton={false} variant="ghost" size="sm" render={<Link href={route("/dashboard/orders")} />}>
            Back to orders
          </Button>
          <h1 className="text-3xl font-semibold tracking-tight">Receipt</h1>
          <p className="text-muted-foreground">Invoice {order.invoiceNumber}</p>
        </div>
        <PrintReceiptButton />
      </div>

      <Card className="print:shadow-none print:ring-0">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">PrepHarbor</p>
              <CardTitle>Tax invoice / receipt</CardTitle>
            </div>
            <Badge variant={order.status === "PAID" ? "default" : "secondary"}>{order.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <dl className="grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Order ID</dt>
              <dd className="font-mono">{order.id}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Invoice number</dt>
              <dd>{order.invoiceNumber}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Billed to</dt>
              <dd>
                {user.name}
                <br />
                {user.email}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Date</dt>
              <dd>{formatDateTime(order.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Payment method</dt>
              <dd>{order.paymentMethod}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Currency</dt>
              <dd>{order.currency}</dd>
            </div>
          </dl>
          <Separator />
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs tracking-wide text-muted-foreground uppercase">
                <th className="py-2 font-medium">Product</th>
                <th className="py-2 font-medium">Exam code</th>
                <th className="py-2 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.practiceTestId} className="border-t">
                  <td className="py-2">{item.testName}</td>
                  <td className="py-2">{item.examCode}</td>
                  <td className="py-2 text-right">{formatInr(item.amountPaise)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t font-semibold">
                <td className="py-3" colSpan={2}>
                  Total
                </td>
                <td className="py-3 text-right">{formatInr(order.amountPaise)}</td>
              </tr>
            </tfoot>
          </table>
          <p className="text-muted-foreground">{order.receiptNote}</p>
        </CardContent>
      </Card>
    </div>
  );
}
