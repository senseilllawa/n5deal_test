import type { Prisma } from "@/lib/generated/prisma/client";
import { toSingle, type RawSearchParams } from "@/lib/search-params";

export interface AssetFilters {
  status?: "ACTIVE" | "PENDING" | "SOLD" | "SUSPENDED";
  sector?: string;
  seller: string;
}

export function parseAssetFilters(searchParams: RawSearchParams): AssetFilters {
  const status = toSingle(searchParams.status);
  return {
    status:
      status === "ACTIVE" || status === "PENDING" || status === "SOLD" || status === "SUSPENDED"
        ? status
        : undefined,
    sector: toSingle(searchParams.sector),
    seller: toSingle(searchParams.seller) ?? "",
  };
}

/** No status filter of its own — a Manager sees every Asset regardless of
 * status, unlike the Buyer catalog or a Seller's own listings. */
export function buildAssetWhere(filters: AssetFilters): Prisma.AssetWhereInput {
  const where: Prisma.AssetWhereInput = {};
  if (filters.status) {
    where.status = filters.status;
  }
  if (filters.sector) {
    where.sector = filters.sector;
  }
  if (filters.seller) {
    where.seller = { name: { contains: filters.seller, mode: "insensitive" } };
  }
  return where;
}
