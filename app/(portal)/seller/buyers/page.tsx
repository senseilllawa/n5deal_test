import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { JURISDICTIONS, SECTORS } from "@/lib/taxonomy";
import { scoreMatch } from "@/lib/matching";
import { BuyerCard, type BuyerCardData } from "./buyer-card";
import { buildBuyerWhere, hasActiveFilters, parseBuyerFilters } from "./filters";

export default async function SellerBuyersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const seller = await requireUser({ role: "SELLER" });
  const filters = parseBuyerFilters(await searchParams);

  const [profiles, myActiveAssets] = await Promise.all([
    prisma.buyerProfile.findMany({
      where: buildBuyerWhere(filters),
      // Stable secondary order either way — when sort=match, the array
      // below is re-sorted by score, and this becomes the tie-break for
      // equal scores (Array#sort is stable) instead of an arbitrary one.
      orderBy: { updatedAt: "desc" },
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    prisma.asset.findMany({
      where: { sellerId: seller.id, status: "ACTIVE" },
      select: { id: true, title: true, sector: true, jurisdiction: true, price: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  let buyers: BuyerCardData[] = profiles.map((p) => ({
    id: p.id,
    userId: p.user.id,
    name: p.user.name,
    email: p.user.email,
    headline: p.headline,
    bio: p.bio,
    sectors: p.sectors,
    jurisdictions: p.jurisdictions,
    budgetMin: p.budgetMin,
    budgetMax: p.budgetMax,
    // Best fit against any one of the seller's own active listings — a
    // Buyer worth talking to about *something* the seller has, not an
    // average across listings that would punish a seller with a broad,
    // varied portfolio.
    matchScore: Math.max(0, ...myActiveAssets.map((asset) => scoreMatch(asset, p))),
  }));

  if (filters.sort === "match") {
    buyers = [...buyers].sort((a, b) => b.matchScore - a.matchScore);
  }

  const myAssets = myActiveAssets.map(({ id, title }) => ({ id, title }));

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 lg:flex-row">
      {/* Native GET form — the URL is the only state; no client JS needed
          for filtering (see CLAUDE.md "Server Actions vs Route Handlers"). */}
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
            Search headline / bio
          </label>
          <Input id="q" name="q" defaultValue={filters.q} placeholder="e.g. lending" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="sort" className="text-sm font-medium">
            Sort by
          </label>
          <select
            id="sort"
            name="sort"
            defaultValue={filters.sort}
            className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm"
          >
            <option value="match">Best match</option>
            <option value="updatedAt">Recently updated</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Budget range (EUR)</span>
          <div className="flex items-center gap-2">
            <Input type="number" name="budgetMin" min={0} defaultValue={filters.budgetMin ?? ""} placeholder="Min" />
            <Input type="number" name="budgetMax" min={0} defaultValue={filters.budgetMax ?? ""} placeholder="Max" />
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="submit">Apply filters</Button>
          {hasActiveFilters(filters) && (
            <Link href="/seller/buyers" className="text-sm text-muted-foreground underline underline-offset-4">
              Clear
            </Link>
          )}
        </div>
      </form>

      <div className="flex flex-1 flex-col gap-4">
        <h1 className="text-xl font-semibold">
          Buyers <span className="font-normal text-muted-foreground">({buyers.length})</span>
        </h1>
        {buyers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No buyers match these filters.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {buyers.map((buyer) => (
              <BuyerCard key={buyer.id} buyer={buyer} myAssets={myAssets} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
