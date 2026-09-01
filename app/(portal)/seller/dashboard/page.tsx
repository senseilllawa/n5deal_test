import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getUnreadCount } from "@/lib/inbox";
import { Greeting } from "./greeting";
import { AssetsStatCard, BrowseBuyersCard, MessagesStatCard } from "./stat-cards";
import { NextSteps } from "./next-steps";
import { MarketplacePulse } from "./marketplace-pulse";

export default async function SellerDashboardPage() {
  const seller = await requireUser({ role: "SELLER" });

  const [assetTotal, assetActive, assetPending, unreadCount] = await Promise.all([
    prisma.asset.count({ where: { sellerId: seller.id } }),
    prisma.asset.count({ where: { sellerId: seller.id, status: "ACTIVE" } }),
    prisma.asset.count({ where: { sellerId: seller.id, status: "PENDING" } }),
    getUnreadCount(seller.id),
  ]);

  return (
    <div className="mx-auto flex max-w-287.5 flex-col gap-8 px-6 py-10">
      <Greeting name={seller.name} email={seller.email} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <AssetsStatCard active={assetActive} pending={assetPending} total={assetTotal} />
        <MessagesStatCard unreadCount={unreadCount} />
        <BrowseBuyersCard />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <NextSteps unreadCount={unreadCount} />
        <MarketplacePulse />
      </div>
    </div>
  );
}
