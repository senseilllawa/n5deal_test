import type { Metadata } from "next";
import type { ReactNode } from "react";
import { requireUser } from "@/lib/auth";
import { getUnreadCount } from "@/lib/inbox";
import { BuyerMobileNav, BuyerSidebar } from "./buyer-nav";

// Same segment-metadata override as /manager and /seller — see
// app/(portal)/manager/layout.tsx's doc comment.
export const metadata: Metadata = {
  title: "N5Deal Marketplace — Buyer",
  description: "Browse matched assets and manage your investment profile on N5Deal.",
};

/**
 * Sidebar + small-screen pill nav around every /buyer page — same shape as
 * the seller layout, including calling requireUser() itself for the
 * sidebar's unread-messages badge (see app/(portal)/seller/layout.tsx's
 * doc comment on why that's not a duplicated auth boundary).
 */
export default async function BuyerLayout({ children }: { children: ReactNode }) {
  const buyer = await requireUser({ role: "BUYER" });
  const unreadCount = await getUnreadCount(buyer.id);

  return (
    <div className="mx-auto flex w-full max-w-7xl items-start">
      <BuyerSidebar unreadCount={unreadCount} />
      <div className="min-w-0 flex-1">
        <div className="px-6 pt-4 lg:hidden">
          <BuyerMobileNav unreadCount={unreadCount} />
        </div>
        {children}
      </div>
    </div>
  );
}
