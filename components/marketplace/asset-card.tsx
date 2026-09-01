import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/marketplace/status-badge";
import { MatchBadge } from "@/components/marketplace/match-badge";
import { flagEmoji, formatPrice } from "@/lib/format";
import type { AssetStatus } from "@/lib/generated/prisma/enums";

/**
 * Shared by /seller/assets and /buyer/assets, which used to have two
 * divergent layouts (a bare <li> row and a Card) for what is structurally
 * the same listing summary. Deliberately has no seller identity field —
 * /buyer never had one to begin with (see buyer/assets/[id]/page.tsx's doc
 * comment on Seller anonymity) and /seller doesn't need to name itself on
 * its own listings, so one shape serves both without a conditional field.
 */
export interface AssetCardData {
  id: string;
  title: string;
  sector: string;
  jurisdiction: string;
  licenseType: string;
  price: number;
  currency: string;
  status: AssetStatus;
  employeeCount: number | null;
  yearIssued: number | null;
}

export function AssetCard({
  asset,
  action,
  matchScore,
}: {
  asset: AssetCardData;
  action?: ReactNode;
  /** Only pass this where a Buyer's own profile is in scope (see
   * lib/matching.ts) — /seller/assets and /manager/* have no such profile
   * to score against, so they simply never pass it and no badge renders. */
  matchScore?: number;
}) {
  return (
    // h-full + the CardContent's flex-1 below are what keep price/action
    // pinned to the same bottom edge across a row of cards with
    // different-length titles/badge counts — see BuyerCard's identical
    // comment (app/(portal)/seller/buyers/buyer-card.tsx) for the full
    // explanation; without it, a grid row's cards end up the same *outer*
    // height (CSS Grid's default row stretch already guarantees that much)
    // but the footer sits wherever the header+content happen to end, which
    // is a different point in every card.
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5 text-base font-semibold">
          <span aria-hidden="true">{flagEmoji(asset.jurisdiction)}</span>
          {asset.title}
        </CardTitle>
        <CardDescription>
          {asset.sector} · {asset.jurisdiction}
        </CardDescription>
        {matchScore !== undefined && (
          <CardAction>
            <MatchBadge score={matchScore} />
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="flex flex-1 flex-wrap content-start items-center gap-1.5">
        <StatusBadge status={asset.status} />
        <Badge variant="outline">{asset.licenseType}</Badge>
        {asset.employeeCount !== null && <Badge variant="secondary">{asset.employeeCount} employees</Badge>}
        {asset.yearIssued !== null && <Badge variant="secondary">Est. {asset.yearIssued}</Badge>}
      </CardContent>
      <CardFooter className="items-center justify-between">
        <span className="text-xl font-semibold tracking-tight">{formatPrice(asset.price, asset.currency)}</span>
        {action}
      </CardFooter>
    </Card>
  );
}
