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
  return (
    <Card>
      <CardHeader>
        <CardTitle>{buyer.name}</CardTitle>
        <CardDescription>{buyer.headline ?? buyer.email}</CardDescription>
        <CardAction>
          <MatchBadge score={buyer.matchScore} />
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
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
        {/* BuyerProfile has no currency field (unlike Asset) — every seed
            budget is EUR, so that's hardcoded here rather than guessed. */}
        {(buyer.budgetMin !== null || buyer.budgetMax !== null) && (
          <p className="text-sm text-muted-foreground">
            Budget:{" "}
            {buyer.budgetMin !== null ? formatPrice(buyer.budgetMin, "EUR") : "—"}
            {" – "}
            {buyer.budgetMax !== null ? formatPrice(buyer.budgetMax, "EUR") : "—"}
          </p>
        )}
      </CardContent>
      <CardFooter className="justify-end">
        <ContactBuyerDialog buyerId={buyer.userId} buyerName={buyer.name} myAssets={myAssets} />
      </CardFooter>
    </Card>
  );
}
