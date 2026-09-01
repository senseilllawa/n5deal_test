import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { MatchBadge } from "@/components/marketplace/match-badge";
import { formatPrice } from "@/lib/format";
import { EMPTY_BUYER_PROFILE, scoreMatch } from "@/lib/matching";
import { ContactSellerDialog } from "./contact-seller-dialog";

/**
 * The Seller is deliberately never named here (or in the catalog card) —
 * "продавец не деанонимизирован до момента контакта": a browsing Buyer
 * sees the listing on its own merits, not who's behind it. Sending a
 * message is the extent of this prototype's "contact" flow; there's no
 * reply thread to build a later reveal-after-first-contact state for.
 */
export default async function BuyerAssetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const buyer = await requireUser({ role: "BUYER" });
  const { id } = await params;

  const [asset, profile] = await Promise.all([
    prisma.asset.findFirst({
      where: { id, status: "ACTIVE", seller: { status: "ACTIVE" } },
      select: {
        id: true,
        title: true,
        description: true,
        sector: true,
        jurisdiction: true,
        licenseType: true,
        price: true,
        currency: true,
        employeeCount: true,
        yearIssued: true,
        includedItems: true,
        sellerId: true,
      },
    }),
    prisma.buyerProfile.findUnique({ where: { userId: buyer.id } }),
  ]);

  if (!asset) {
    notFound();
  }

  // A plain awaited mutation during a Server Component's render is fine —
  // unlike cookies(), Next doesn't restrict writes here. Just a coarse
  // interest signal for the Seller/Manager (see Asset.viewCount's doc
  // comment in schema.prisma), not a per-viewer "seen" receipt.
  await prisma.asset.update({ where: { id: asset.id }, data: { viewCount: { increment: 1 } } });

  const matchScore = scoreMatch(asset, profile ?? EMPTY_BUYER_PROFILE);

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl font-semibold">{asset.title}</h1>
        <MatchBadge score={matchScore} />
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Listed by a Seller · {asset.sector} · {asset.jurisdiction}
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        <Badge variant="secondary">{asset.sector}</Badge>
        <Badge variant="outline">{asset.jurisdiction}</Badge>
        <Badge variant="outline">{asset.licenseType}</Badge>
      </div>

      <p className="mt-6 text-3xl font-semibold">{formatPrice(asset.price, asset.currency)}</p>

      <p className="mt-4 whitespace-pre-wrap text-sm">{asset.description}</p>

      <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
        {asset.employeeCount !== null && (
          <div>
            <dt className="text-muted-foreground">Employees</dt>
            <dd>{asset.employeeCount}</dd>
          </div>
        )}
        {asset.yearIssued !== null && (
          <div>
            <dt className="text-muted-foreground">Year issued</dt>
            <dd>{asset.yearIssued}</dd>
          </div>
        )}
      </dl>

      {asset.includedItems.length > 0 && (
        <div className="mt-6">
          <p className="text-sm font-medium">What&apos;s included</p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {asset.includedItems.map((item) => (
              <li key={item}>
                <Badge variant="secondary">{item}</Badge>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8">
        <ContactSellerDialog sellerId={asset.sellerId} assetId={asset.id} />
      </div>
    </div>
  );
}
