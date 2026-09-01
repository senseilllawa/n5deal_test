import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AssetCard } from "@/components/marketplace/asset-card";
import { JURISDICTIONS, SECTORS } from "@/lib/taxonomy";
import { EMPTY_BUYER_PROFILE, scoreMatch } from "@/lib/matching";
import { buildAssetWhere, hasActiveFilters, parseAssetFilters } from "./filters";
import type { RawSearchParams } from "@/lib/search-params";

export default async function BuyerAssetsPage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  const buyer = await requireUser({ role: "BUYER" });
  const filters = parseAssetFilters(await searchParams);

  const [assets, profile] = await Promise.all([
    prisma.asset.findMany({
      where: buildAssetWhere(filters),
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        sector: true,
        jurisdiction: true,
        licenseType: true,
        price: true,
        currency: true,
        status: true,
        employeeCount: true,
        yearIssued: true,
      },
    }),
    prisma.buyerProfile.findUnique({ where: { userId: buyer.id } }),
  ]);
  const matchProfile = profile ?? EMPTY_BUYER_PROFILE;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 lg:flex-row">
      {/* Native GET form — same URL-as-source-of-truth approach as
          /seller/buyers, no client JS needed for filtering. */}
      <form method="get" className="flex w-full shrink-0 flex-col gap-5 lg:w-56">
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-sm font-medium">Sectors</legend>
          {SECTORS.map((sector) => (
            <label key={sector} className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="sectors" value={sector} defaultChecked={filters.sectors.includes(sector)} />
              {sector}
            </label>
          ))}
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-sm font-medium">Jurisdictions</legend>
          {JURISDICTIONS.map((j) => (
            <label key={j.code} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="jurisdictions"
                value={j.code}
                defaultChecked={filters.jurisdictions.includes(j.code)}
              />
              {j.label} ({j.code})
            </label>
          ))}
        </fieldset>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="q" className="text-sm font-medium">
            Search title / description
          </label>
          <Input id="q" name="q" defaultValue={filters.q} placeholder="e.g. lending" />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Price range (asset&apos;s own currency)</span>
          <div className="flex items-center gap-2">
            <Input type="number" name="priceMin" min={0} defaultValue={filters.priceMin ?? ""} placeholder="Min" />
            <Input type="number" name="priceMax" min={0} defaultValue={filters.priceMax ?? ""} placeholder="Max" />
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="submit">Apply filters</Button>
          {hasActiveFilters(filters) && (
            <Link href="/buyer/assets" className="text-sm text-muted-foreground underline underline-offset-4">
              Clear
            </Link>
          )}
        </div>
      </form>

      <div className="flex flex-1 flex-col gap-4">
        <h1 className="text-xl font-semibold">
          Assets <span className="font-normal text-muted-foreground">({assets.length})</span>
        </h1>
        {assets.length === 0 ? (
          <p className="text-sm text-muted-foreground">No assets match these filters.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {assets.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                matchScore={scoreMatch(asset, matchProfile)}
                action={
                  <Link href={`/buyer/assets/${asset.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                    View
                  </Link>
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
