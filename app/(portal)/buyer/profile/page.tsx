import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { BuyerProfileForm } from "./buyer-profile-form";

export default async function BuyerProfilePage() {
  const buyer = await requireUser({ role: "BUYER" });
  const profile = await prisma.buyerProfile.findUnique({ where: { userId: buyer.id } });

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Investment profile</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">Your investment profile</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        This is what Sellers see when browsing Buyers — keep it current so the right listings find you.
      </p>
      <div className="mt-6">
        <BuyerProfileForm initial={profile} />
      </div>
    </div>
  );
}
