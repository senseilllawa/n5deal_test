"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Inbox, LayoutDashboard, LifeBuoy, Package, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/seller/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/seller/assets", label: "Your assets", icon: Package },
  { href: "/seller/inbox", label: "Messages", icon: Inbox },
  { href: "/seller/buyers", label: "Browse buyers", icon: Users },
] as const;

/** Manager's ManagerSidebar/ManagerMobileNav split, same shape — see
 * app/(portal)/manager/manager-nav.tsx's doc comment for why this isn't a
 * single shared component: the nav items and the unread badge are
 * seller-specific, and duplicating ~60 lines here is cheaper than adding a
 * generic-but-awkward props API to the manager version for one reuse. */
function useIsActive() {
  const pathname = usePathname();
  return (href: string) => pathname === href;
}

export function SellerSidebar({ unreadCount }: { unreadCount: number }) {
  const isActive = useIsActive();

  return (
    <aside className="hidden w-60 shrink-0 flex-col gap-6 self-start lg:sticky lg:top-[57px] lg:flex lg:h-[calc(100vh-57px)] lg:overflow-y-auto lg:border-r lg:border-border lg:px-4 lg:py-6">
      <div>
        <p className="px-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">Workspace</p>
        <nav className="mt-2 flex flex-col gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(href) ? "page" : undefined}
              className={cn(
                "flex items-center justify-between gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                isActive(href) && "bg-accent text-foreground"
              )}
            >
              <span className="flex items-center gap-2.5">
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                {label}
              </span>
              {href === "/seller/inbox" && unreadCount > 0 && (
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-status-pending/15 text-xs font-medium text-status-pending">
                  {unreadCount}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-auto rounded-xl border border-border bg-card p-4">
        <LifeBuoy className="size-5 text-primary" aria-hidden="true" />
        <p className="mt-2 text-sm font-medium">Seller resources</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Keep your listings sharp and know what buyers are looking for before you reach out.
        </p>
        <Link
          href="/seller/buyers"
          className={buttonVariants({ variant: "outline", size: "sm", className: "mt-3 w-full" })}
        >
          Browse buyers
        </Link>
      </div>
    </aside>
  );
}

export function SellerMobileNav({ unreadCount }: { unreadCount: number }) {
  const isActive = useIsActive();

  return (
    <nav
      aria-label="Seller sections"
      className="-mx-6 flex gap-2 overflow-x-auto border-b border-border px-6 pb-3 lg:hidden"
    >
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          aria-current={isActive(href) ? "page" : undefined}
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            isActive(href) && "border-transparent bg-primary text-primary-foreground"
          )}
        >
          <Icon className="size-3.5 shrink-0" aria-hidden="true" />
          {label}
          {href === "/seller/inbox" && unreadCount > 0 && (
            <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-status-pending/20 text-[10px] font-medium text-status-pending">
              {unreadCount}
            </span>
          )}
        </Link>
      ))}
    </nav>
  );
}
