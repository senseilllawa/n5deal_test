import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getUnreadCount } from "@/lib/inbox";
import { Greeting } from "./greeting";
import { BrowseAssetsCard, MessagesStatCard, ProfileStatCard } from "./stat-cards";
import { QuickActions } from "./quick-actions";

export default async function BuyerDashboardPage() {
  const buyer = await requireUser({ role: "BUYER" });

  const [profile, unreadCount] = await Promise.all([
    prisma.buyerProfile.findUnique({ where: { userId: buyer.id }, select: { id: true } }),
    getUnreadCount(buyer.id),
  ]);

  return (
    <div className="mx-auto flex max-w-287.5 flex-col gap-8 px-6 py-10">
      <Greeting name={buyer.name} email={buyer.email} hasProfile={profile !== null} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ProfileStatCard hasProfile={profile !== null} />
        <MessagesStatCard unreadCount={unreadCount} />
        <BrowseAssetsCard />
      </div>

      <QuickActions />
    </div>
  );
}
