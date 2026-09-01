import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DashboardLinkCard } from "@/components/marketplace/dashboard-link-card";

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
        <DashboardLinkCard href="/buyer/profile" title="Your profile" contentClassName="text-sm text-muted-foreground">
          {hasProfile ? "Edit your investment profile" : "Set up your investment profile"}
        </DashboardLinkCard>
        <DashboardLinkCard href="/buyer/inbox" title="Unread messages" contentClassName="text-2xl font-semibold">
          {unreadCount}
        </DashboardLinkCard>
        <DashboardLinkCard href="/buyer/assets" title="Browse assets" contentClassName="text-sm text-muted-foreground">
          Find and contact matching Sellers
        </DashboardLinkCard>
      </div>
    </div>
  );
}
