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
    <header className="sticky top-0 z-40 flex items-center justify-between border-b bg-card/95 px-6 py-3 backdrop-blur supports-backdrop-filter:bg-card/75">
      <Link href={roleHomePath(user.role)} className="flex items-center gap-2.5">
        {/* Logo placeholder — a monogram mark, not an external asset. */}
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
          N5
        </span>
        <span className="text-sm font-semibold tracking-tight">N5Deal Marketplace</span>
      </Link>
      <div className="flex items-center gap-3">
        <span className="text-sm text-foreground">{user.name}</span>
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
