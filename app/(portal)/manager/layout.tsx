import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ManagerMobileNav, ManagerSidebar } from "./manager-nav";

// Overrides the root layout's metadata for everything under /manager only
// (Next.js merges metadata down the segment tree) — Buyer/Seller/login keep
// the generic title, this section gets its own tab title as requested.
export const metadata: Metadata = {
  title: "N5Deal Marketplace — Manager",
  description: "Marketplace operations dashboard for N5Deal.",
};

// Purely presentational shell (sidebar + small-screen pill nav) around
// every /manager page. Auth is already handled by the (portal) group's
// layout (requireUser()) plus each page's own requireUser({ role:
// "MANAGER" }) — this component doesn't re-check either, on purpose, so
// as not to duplicate that boundary in a third place.
export default function ManagerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-7xl items-start">
      <ManagerSidebar />
      <div className="min-w-0 flex-1">
        <div className="px-6 pt-4 lg:hidden">
          <ManagerMobileNav />
        </div>
        {children}
      </div>
    </div>
  );
}
