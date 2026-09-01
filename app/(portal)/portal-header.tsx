import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { roleHomePath } from "@/lib/roles";
import { logout } from "./actions";
import type { Role, User } from "@/lib/generated/prisma/client";

const ROLE_LABEL: Record<Role, string> = {
  BUYER: "Buyer",
  SELLER: "Seller",
  MANAGER: "Manager",
};

export function PortalHeader({ user }: { user: User }) {
  return (
    <header className="sticky top-0 z-40 flex min-w-0 items-center justify-between gap-3 border-b bg-card/95 px-4 py-2.5 backdrop-blur supports-backdrop-filter:bg-card/75 sm:px-6">
      <Link href={roleHomePath(user.role)} className="flex min-w-0 items-center gap-2.5 sm:gap-3">
        {/* Logo placeholder — a monogram mark, not an external asset. */}
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground sm:size-9 sm:text-sm">
          N5
        </span>
        <span className="flex min-w-0 flex-col leading-tight">
          <span className="truncate text-sm font-semibold tracking-tight">N5Deal Marketplace</span>
          {/* Tagline only where there's room to breathe — on a narrow
              phone header it's the first thing worth dropping. */}
          <span className="hidden text-xs text-muted-foreground sm:block">Marketplace operations</span>
        </span>
      </Link>
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {/* Name follows the same rule — the role badge alone is enough
            identity on a phone-width header. */}
        <span className="hidden text-sm text-foreground sm:inline">{user.name}</span>
        <Badge variant="secondary">{ROLE_LABEL[user.role]}</Badge>
        <form action={logout}>
          <Button type="submit" variant="ghost" size="sm">
            Log out
          </Button>
        </form>
      </div>
    </header>
  );
}
