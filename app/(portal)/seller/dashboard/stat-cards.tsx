import { ArrowRight } from "lucide-react";
import { DashboardLinkCard } from "@/components/marketplace/dashboard-link-card";

export function AssetsStatCard({ active, pending, total }: { active: number; pending: number; total: number }) {
  return (
    <DashboardLinkCard
      href="/seller/assets"
      title="Your assets"
      contentClassName="flex flex-col gap-1"
      corner={
        <span
          className={`size-2 rounded-full ${active > 0 ? "bg-status-active" : "bg-muted-foreground/40"}`}
          aria-hidden="true"
        />
      }
    >
      <span className="text-3xl font-semibold tracking-tight">{total}</span>
      <span className="text-sm text-muted-foreground">
        {active} active · {pending} pending
      </span>
    </DashboardLinkCard>
  );
}

export function MessagesStatCard({ unreadCount }: { unreadCount: number }) {
  const hasUnread = unreadCount > 0;
  return (
    <DashboardLinkCard
      href="/seller/inbox"
      title="Unread messages"
      contentClassName="flex flex-col gap-1"
      corner={
        <span
          className={`size-2 rounded-full ${hasUnread ? "bg-status-pending" : "bg-status-active"}`}
          aria-hidden="true"
        />
      }
    >
      <span className="text-3xl font-semibold tracking-tight">{unreadCount}</span>
      <span className="text-sm text-muted-foreground">
        {hasUnread ? "Needs your attention" : "You're all caught up"}
      </span>
    </DashboardLinkCard>
  );
}

export function BrowseBuyersCard() {
  return (
    <DashboardLinkCard
      href="/seller/buyers"
      title="Browse buyers"
      contentClassName="flex flex-col gap-2"
      corner={
        <ArrowRight
          className="size-4 text-muted-foreground transition-colors group-hover:text-primary"
          aria-hidden="true"
        />
      }
    >
      <span className="text-sm text-muted-foreground">Find and contact matching Buyers.</span>
      <span className="text-sm font-medium text-primary">Explore marketplace</span>
    </DashboardLinkCard>
  );
}
