import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { userOwnsPracticeTest } from "@/lib/commerce/checkout";
import { listPurchasesForUser } from "@/lib/commerce/order-store";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const slug = new URL(request.url).searchParams.get("slug");
  if (slug) {
    const owned = await userOwnsPracticeTest(session.user.id, slug);
    return NextResponse.json({ slug, owned, status: owned ? "PAID" : "NONE" });
  }

  const purchases = await listPurchasesForUser(session.user.id);
  return NextResponse.json({
    purchases: purchases.map((item) => ({
      practiceTestSlug: item.practiceTestId,
      examCode: item.examCode,
      status: "PAID",
      purchasedAt: item.purchasedAt,
      orderId: item.orderId,
    })),
  });
}
