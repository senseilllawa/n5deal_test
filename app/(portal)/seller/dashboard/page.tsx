import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DashboardLinkCard } from "@/components/marketplace/dashboard-link-card";

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
        <DashboardLinkCard href="/seller/assets" title="Your assets" contentClassName="text-2xl font-semibold">
          {assetCount}
        </DashboardLinkCard>
        <DashboardLinkCard href="/seller/inbox" title="Unread messages" contentClassName="text-2xl font-semibold">
          {unreadCount}
        </DashboardLinkCard>
        <DashboardLinkCard href="/seller/buyers" title="Browse Buyers" contentClassName="text-sm text-muted-foreground">
          Find and contact matching Buyers
        </DashboardLinkCard>
      </div>
    </div>
  );
}
