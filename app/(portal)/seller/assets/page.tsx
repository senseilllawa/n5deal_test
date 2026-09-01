import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { buttonVariants } from "@/components/ui/button";
import { AssetCard } from "@/components/marketplace/asset-card";

export default async function SellerAssetsPage() {
  const seller = await requireUser({ role: "SELLER" });

  // Own assets, every status included — "свои он должен видеть в любом
  // статусе" is the one explicit exception to hiding suspended/removed
  // things from a Seller.
  const assets = await prisma.asset.findMany({
    where: { sellerId: seller.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">
          Your assets <span className="font-normal text-muted-foreground">({assets.length})</span>
        </h1>
        <Link href="/seller/assets/new" className={buttonVariants()}>
          New asset
        </Link>
      </div>

      {assets.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">You haven&apos;t published any assets yet.</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {assets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      )}
    </div>
  );
}
