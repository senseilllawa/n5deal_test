import Link from "next/link";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
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
  const active = hasActiveFilters(filters);

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
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 lg:flex-row lg:items-start">
      {/* Native GET form — same URL-as-source-of-truth approach as
          /seller/buyers, no client JS needed for filtering. The
          checkbox+label below is a pure-CSS collapsible panel for small
          screens (see PILL/peer pattern note in buyer-profile-form.tsx for
          the sibling relationship this relies on) — on lg+ it's simply
          always open, styled as a plain sidebar instead of a boxed panel. */}
      <div className="flex w-full shrink-0 flex-col gap-3 lg:w-64">
        <input type="checkbox" id="assets-filters-toggle" defaultChecked={active} className="peer sr-only" />
        <label
          htmlFor="assets-filters-toggle"
          className="flex cursor-pointer items-center justify-between gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium outline-none transition-colors hover:border-foreground/30 has-focus-visible:ring-2 has-focus-visible:ring-ring has-focus-visible:ring-offset-2 has-focus-visible:ring-offset-background lg:hidden"
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="size-4" aria-hidden="true" />
            Filters
            {active && <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-xs font-medium text-primary">Active</span>}
          </span>
          <ChevronDown className="size-4 shrink-0 transition-transform peer-checked:rotate-180" aria-hidden="true" />
        </label>

        <form
          method="get"
          className="hidden flex-col gap-6 rounded-xl border border-border bg-card p-4 peer-checked:flex lg:sticky lg:top-[57px] lg:flex lg:rounded-none lg:border-0 lg:border-r lg:bg-transparent lg:p-0 lg:pr-4"
        >
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">Sectors</legend>
            {SECTORS.map((sector) => (
              <label key={sector} className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="sectors" value={sector} defaultChecked={filters.sectors.includes(sector)} />
                {sector}
              </label>
            ))}
          </fieldset>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">Jurisdictions</legend>
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
            <label htmlFor="q" className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Search title / description
            </label>
            <Input id="q" name="q" defaultValue={filters.q} placeholder="e.g. lending" />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Price range (asset&apos;s own currency)
            </span>
            <div className="flex items-center gap-2">
              <Input type="number" name="priceMin" min={0} defaultValue={filters.priceMin ?? ""} placeholder="Min" />
              <Input type="number" name="priceMax" min={0} defaultValue={filters.priceMax ?? ""} placeholder="Max" />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit">Apply filters</Button>
            {active && (
              <Link href="/buyer/assets" className="text-sm text-muted-foreground underline underline-offset-4">
                Clear
              </Link>
            )}
          </div>
        </form>
      </div>

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
