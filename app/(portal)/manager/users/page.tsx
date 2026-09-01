import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/marketplace/data-table";
import { StatusBadge } from "@/components/marketplace/status-badge";
import { ModerationDialog } from "@/components/marketplace/moderation-dialog";
import { reactivateUser, removeUser, suspendUser } from "@/lib/actions/moderation";
import { titleCase } from "@/lib/format";
import type { RawSearchParams } from "@/lib/search-params";
import { buildUserWhere, parseUserFilters } from "./filters";

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

const SELECT_CLASS = "h-8 rounded-lg border border-input bg-transparent px-2 text-sm";

// Managers are never a moderation target (see filters.ts) — the assignment
// scopes /manager/users to marketplace participants, not platform staff.
export default async function ManagerUsersPage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  await requireUser({ role: "MANAGER" });
  const filters = parseUserFilters(await searchParams);

  const users = await prisma.user.findMany({
    where: buildUserWhere(filters),
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-xl font-semibold">
        Users <span className="font-normal text-muted-foreground">({users.length})</span>
      </h1>

      <form method="get" className="mt-4 flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="role" className="text-sm font-medium">
            Role
          </label>
          <select id="role" name="role" defaultValue={filters.role ?? ""} className={SELECT_CLASS}>
            <option value="">All</option>
            <option value="BUYER">Buyer</option>
            <option value="SELLER">Seller</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="status" className="text-sm font-medium">
            Status
          </label>
          <select id="status" name="status" defaultValue={filters.status ?? ""} className={SELECT_CLASS}>
            <option value="">All</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="REMOVED">Removed</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="q" className="text-sm font-medium">
            Search name/email
          </label>
          <Input id="q" name="q" defaultValue={filters.q} className="w-56" />
        </div>
        <Button type="submit">Apply</Button>
      </form>

      <div className="mt-6">
        <DataTable
          rows={users}
          emptyMessage="No users match these filters."
          columns={[
            { header: "Name", cell: (u) => u.name },
            { header: "Email", cell: (u) => u.email },
            { header: "Role", cell: (u) => titleCase(u.role) },
            { header: "Status", cell: (u) => <StatusBadge status={u.status} reason={u.statusReason} /> },
            { header: "Created", cell: (u) => formatDate(u.createdAt) },
          ]}
          actions={(u) => (
            <>
              {u.status === "ACTIVE" && (
                <ModerationDialog
                  targetId={u.id}
                  action={suspendUser}
                  triggerLabel="Suspend"
                  title={`Suspend ${u.name}`}
                  description="They're signed out immediately and blocked from logging back in until reactivated."
                  reasonRequired
                />
              )}
              {u.status === "SUSPENDED" && (
                <form action={reactivateUser.bind(null, u.id)}>
                  <Button type="submit" variant="outline" size="sm">
                    Reactivate
                  </Button>
                </form>
              )}
              {u.status !== "REMOVED" && (
                <ModerationDialog
                  targetId={u.id}
                  action={removeUser}
                  triggerLabel="Remove"
                  title={`Remove ${u.name}`}
                  description="Soft-delete — they can never log back in. Their past assets and messages stay intact for whoever they dealt with."
                  reasonRequired={false}
                />
              )}
            </>
          )}
        />
      </div>
    </div>
  );
}
