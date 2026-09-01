import type { ReactNode } from "react";
import { requireUser } from "@/lib/auth";
import { PortalHeader } from "./portal-header";

/**
 * Wraps /seller, /buyer, /manager (route group — doesn't affect the URL).
 * Guarantees "someone is signed in and active"; it does NOT check role —
 * each role's own page calls `requireUser({ role: ... })` itself. See
 * CLAUDE.md "Route groups & guards".
 */
export default async function PortalLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();

  return (
    <div className="flex min-h-full flex-col">
      <PortalHeader user={user} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
