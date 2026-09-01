import { ArrowRight } from "lucide-react";
import { DashboardLinkCard } from "@/components/marketplace/dashboard-link-card";

export function ProfileStatCard({ hasProfile }: { hasProfile: boolean }) {
  return (
    <DashboardLinkCard
      href="/buyer/profile"
      title="Your profile"
      contentClassName="flex flex-col gap-2"
      corner={
        <span
          className={`size-2 rounded-full ${hasProfile ? "bg-status-active" : "bg-muted-foreground/40"}`}
          aria-hidden="true"
        />
      }
    >
      <span className="text-sm text-muted-foreground">
        {hasProfile ? "Edit your investment profile" : "Set up your investment profile"}
      </span>
      <span className="text-sm font-medium text-primary">Edit profile</span>
    </DashboardLinkCard>
  );
}

export function MessagesStatCard({ unreadCount }: { unreadCount: number }) {
  const hasUnread = unreadCount > 0;
  return (
    <DashboardLinkCard
      href="/buyer/inbox"
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
      <span className="text-sm text-muted-foreground">{hasUnread ? "Needs your attention" : "No new messages"}</span>
    </DashboardLinkCard>
  );
}

export function BrowseAssetsCard() {
  return (
    <DashboardLinkCard
      href="/buyer/assets"
      title="Browse assets"
      contentClassName="flex flex-col gap-2"
      corner={
        <ArrowRight
          className="size-4 text-muted-foreground transition-colors group-hover:text-primary"
          aria-hidden="true"
        />
      }
    >
      <span className="text-sm text-muted-foreground">Find and contact matching Sellers.</span>
      <span className="text-sm font-medium text-primary">Browse assets</span>
    </DashboardLinkCard>
  );
}
