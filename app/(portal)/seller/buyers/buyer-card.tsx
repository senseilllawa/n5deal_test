import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MatchBadge } from "@/components/marketplace/match-badge";
import { formatPrice } from "@/lib/format";
import { ContactBuyerDialog } from "./contact-buyer-dialog";

export interface BuyerCardData {
  id: string; // BuyerProfile id — not used for contact, just React key stability
  userId: string;
  name: string;
  email: string;
  headline: string | null;
  bio: string | null;
  sectors: string[];
  jurisdictions: string[];
  budgetMin: number | null;
  budgetMax: number | null;
  /** Best lib/matching.ts score against any of the seller's own ACTIVE
   * assets — this page's default sort order, so showing it explains why
   * the catalog is ordered the way it is. */
  matchScore: number;
}

export function BuyerCard({ buyer, myAssets }: { buyer: BuyerCardData; myAssets: { id: string; title: string }[] }) {
  const hasBudget = buyer.budgetMin !== null || buyer.budgetMax !== null;

  return (
    // h-full + CardContent's flex-1 below keep every card in a row the same
    // outer height (CSS Grid's row-stretch already gives that) *and* keep
    // the Budget/Contact footer pinned to the same bottom edge regardless
    // of how long a given buyer's bio or badge list runs — see AssetCard's
    // identical comment (components/marketplace/asset-card.tsx). Budget
    // moved into the footer alongside Contact for the same reason it lives
    // in AssetCard's footer next to price: it's this card's "price row,"
    // so it gets the one guaranteed-consistent position on the card.
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{buyer.name}</CardTitle>
        <CardDescription>{buyer.headline ?? buyer.email}</CardDescription>
        <CardAction>
          <MatchBadge score={buyer.matchScore} />
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-2">
        {buyer.bio && <p className="text-sm text-muted-foreground">{buyer.bio}</p>}
        <div className="flex flex-wrap gap-1">
          {buyer.sectors.map((s) => (
            <Badge key={s} variant="secondary">
              {s}
            </Badge>
          ))}
          {buyer.jurisdictions.map((j) => (
            <Badge key={j} variant="outline">
              {j}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="items-center justify-between gap-2">
        {/* BuyerProfile has no currency field (unlike Asset) — every seed
            budget is EUR, so that's hardcoded here rather than guessed. An
            empty span (rather than switching to justify-end) keeps Contact
            in the exact same spot whether or not a given buyer has a
            budget set. */}
        {hasBudget ? (
          <span className="text-sm text-muted-foreground">
            {buyer.budgetMin !== null ? formatPrice(buyer.budgetMin, "EUR") : "—"}
            {" – "}
            {buyer.budgetMax !== null ? formatPrice(buyer.budgetMax, "EUR") : "—"}
          </span>
        ) : (
          <span />
        )}
        <ContactBuyerDialog buyerId={buyer.userId} buyerName={buyer.name} myAssets={myAssets} />
      </CardFooter>
    </Card>
  );
}
