"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LifeBuoy, Package, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/manager/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/manager/users", label: "Users", icon: Users },
  { href: "/manager/assets", label: "Assets", icon: Package },
];

/** Manager section nav — one source of truth for both the desktop sidebar
 * and the small-screen pill bar below, so the two can never drift apart. */
function useIsActive() {
  const pathname = usePathname();
  return (href: string) => pathname === href;
}

export function ManagerSidebar() {
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
                "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                isActive(href) && "bg-accent text-foreground"
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              {label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-auto rounded-xl border border-border bg-card p-4">
        <LifeBuoy className="size-5 text-primary" aria-hidden="true" />
        <p className="mt-2 text-sm font-medium">Need a hand?</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Review suspended accounts and pending listings to keep the marketplace healthy.
        </p>
        <Link
          href="/manager/users"
          className={buttonVariants({ variant: "outline", size: "sm", className: "mt-3 w-full" })}
        >
          Go to Users
        </Link>
      </div>
    </aside>
  );
}

export function ManagerMobileNav() {
  const isActive = useIsActive();

  return (
    <nav
      aria-label="Manager sections"
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
        </Link>
      ))}
    </nav>
  );
}
