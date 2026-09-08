import { auth } from "@/auth";
import { userOwnsPracticeTest } from "@/lib/commerce/checkout";
import { listPurchasesForUser } from "@/lib/commerce/order-store";
import { jsonError, jsonOk } from "@/lib/http";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return jsonError("Sign in required.", 401);
  }

  const slug = new URL(request.url).searchParams.get("slug");
  if (slug) {
    const owned = await userOwnsPracticeTest(session.user.id, slug);
    return jsonOk({ slug, owned, status: owned ? "PAID" : "NONE" });
  }

  const purchases = await listPurchasesForUser(session.user.id);
  return jsonOk({
    purchases: purchases.map((item) => ({
      practiceTestSlug: item.practiceTestId,
      examCode: item.examCode,
      status: "PAID",
      purchasedAt: item.purchasedAt,
      orderId: item.orderId,
    })),
  });
}
