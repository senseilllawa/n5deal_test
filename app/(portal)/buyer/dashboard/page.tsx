import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function BuyerDashboardPage() {
  const buyer = await requireUser({ role: "BUYER" });

  const [hasProfile, unreadCount] = await Promise.all([
    prisma.buyerProfile.findUnique({ where: { userId: buyer.id }, select: { id: true } }),
    prisma.contactRequest.count({ where: { toUserId: buyer.id, isRead: false } }),
  ]);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-10">
      <div>
        <h1 className="text-xl font-semibold">Welcome, {buyer.name}</h1>
        <p className="text-sm text-muted-foreground">{buyer.email}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link href="/buyer/profile">
          <Card>
            <CardHeader>
              <CardTitle>Your profile</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {hasProfile ? "Edit your investment profile" : "Set up your investment profile"}
            </CardContent>
          </Card>
        </Link>
        <Link href="/buyer/inbox">
          <Card>
            <CardHeader>
              <CardTitle>Unread messages</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">{unreadCount}</CardContent>
          </Card>
        </Link>
        <Link href="/buyer/assets">
          <Card>
            <CardHeader>
              <CardTitle>Browse assets</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">Find and contact matching Sellers</CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
