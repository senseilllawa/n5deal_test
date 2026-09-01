import type { Metadata } from "next";
import type { ReactNode } from "react";
import { requireUser } from "@/lib/auth";
import { getUnreadCount } from "@/lib/inbox";
import { SellerMobileNav, SellerSidebar } from "./seller-nav";

// Overrides the root layout's metadata for everything under /seller only
// (see app/(portal)/manager/layout.tsx for the same pattern) — Buyer/
// Manager/login keep the generic title.
export const metadata: Metadata = {
  title: "N5Deal Marketplace — Seller",
  description: "Manage your listings and buyer conversations on N5Deal.",
};

/**
 * Sidebar + small-screen pill nav around every /seller page. Unlike the
 * manager version, this one DOES call requireUser() itself — not to
 * duplicate the (portal) group's auth boundary, but because the sidebar's
 * unread-messages badge needs the signed-in seller's id. That's cheap: see
 * lib/auth.ts's findUserById and lib/inbox.ts's getUnreadCount, both
 * request-cached, so the page this layout wraps re-deriving the same
 * values costs zero extra DB round trips.
 */
export default async function SellerLayout({ children }: { children: ReactNode }) {
  const seller = await requireUser({ role: "SELLER" });
  const unreadCount = await getUnreadCount(seller.id);

  return (
    <div className="mx-auto flex w-full max-w-7xl items-start">
      <SellerSidebar unreadCount={unreadCount} />
      <div className="min-w-0 flex-1">
        <div className="px-6 pt-4 lg:hidden">
          <SellerMobileNav unreadCount={unreadCount} />
        </div>
        {children}
      </div>
    </div>
  );
}
