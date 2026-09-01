import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SellerDashboardPage() {
  const seller = await requireUser({ role: "SELLER" });

  const [assetCount, unreadCount] = await Promise.all([
    prisma.asset.count({ where: { sellerId: seller.id } }),
    prisma.contactRequest.count({ where: { toUserId: seller.id, isRead: false } }),
  ]);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-10">
      <div>
        <h1 className="text-xl font-semibold">Welcome, {seller.name}</h1>
        <p className="text-sm text-muted-foreground">{seller.email}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link href="/seller/assets">
          <Card>
            <CardHeader>
              <CardTitle>Your assets</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">{assetCount}</CardContent>
          </Card>
        </Link>
        <Link href="/seller/inbox">
          <Card>
            <CardHeader>
              <CardTitle>Unread messages</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">{unreadCount}</CardContent>
          </Card>
        </Link>
        <Link href="/seller/buyers">
          <Card>
            <CardHeader>
              <CardTitle>Browse Buyers</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">Find and contact matching Buyers</CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
