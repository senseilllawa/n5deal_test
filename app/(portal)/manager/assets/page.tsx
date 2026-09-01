import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/marketplace/data-table";
import { StatusBadge } from "@/components/marketplace/status-badge";
import { ModerationDialog } from "@/components/marketplace/moderation-dialog";
import { restoreAsset, suspendAsset } from "@/lib/actions/moderation";
import { formatPrice } from "@/lib/format";
import { SECTORS } from "@/lib/taxonomy";
import type { RawSearchParams } from "@/lib/search-params";
import { buildAssetWhere, parseAssetFilters } from "./filters";

const SELECT_CLASS = "h-8 rounded-lg border border-input bg-transparent px-2 text-sm";

export default async function ManagerAssetsPage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  await requireUser({ role: "MANAGER" });
  const filters = parseAssetFilters(await searchParams);

  const assets = await prisma.asset.findMany({
    where: buildAssetWhere(filters),
    orderBy: { createdAt: "desc" },
    include: { seller: { select: { name: true } } },
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-xl font-semibold">
        Assets <span className="font-normal text-muted-foreground">({assets.length})</span>
      </h1>

      <form method="get" className="mt-4 flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="status" className="text-sm font-medium">
            Status
          </label>
          <select id="status" name="status" defaultValue={filters.status ?? ""} className={SELECT_CLASS}>
            <option value="">All</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending</option>
            <option value="SOLD">Sold</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="sector" className="text-sm font-medium">
            Sector
          </label>
          <select id="sector" name="sector" defaultValue={filters.sector ?? ""} className={SELECT_CLASS}>
            <option value="">All</option>
            {SECTORS.map((sector) => (
              <option key={sector} value={sector}>
                {sector}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="seller" className="text-sm font-medium">
            Seller name
          </label>
          <Input id="seller" name="seller" defaultValue={filters.seller} className="w-56" />
        </div>
        <Button type="submit">Apply</Button>
      </form>

      <div className="mt-6">
        <DataTable
          rows={assets}
          emptyMessage="No assets match these filters."
          columns={[
            { header: "Title", cell: (a) => a.title },
            { header: "Seller", cell: (a) => a.seller.name },
            { header: "Sector", cell: (a) => a.sector },
            { header: "Status", cell: (a) => <StatusBadge status={a.status} /> },
            { header: "Price", cell: (a) => formatPrice(a.price, a.currency), align: "right" },
          ]}
          actions={(a) => (
            <>
              {a.status === "ACTIVE" && (
                <ModerationDialog
                  targetId={a.id}
                  action={suspendAsset}
                  triggerLabel="Suspend"
                  title={`Suspend "${a.title}"`}
                  description="Hides it from every Buyer and from search — the Seller keeps seeing it on their own /seller/assets, marked Suspended."
                  reasonRequired
                />
              )}
              {a.status === "SUSPENDED" && (
                <form action={restoreAsset.bind(null, a.id)}>
                  <Button type="submit" variant="outline" size="sm">
                    Restore
                  </Button>
                </form>
              )}
            </>
          )}
        />
      </div>
    </div>
  );
}
