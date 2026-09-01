import type { Prisma } from "@/lib/generated/prisma/client";
import { toArray, toNumber, toSingle, type RawSearchParams } from "@/lib/search-params";

export interface AssetFilters {
  sectors: string[];
  jurisdictions: string[];
  q: string;
  priceMin?: number;
  priceMax?: number;
}

export function parseAssetFilters(searchParams: RawSearchParams): AssetFilters {
  return {
    sectors: toArray(searchParams.sectors),
    jurisdictions: toArray(searchParams.jurisdictions),
    q: toSingle(searchParams.q) ?? "",
    priceMin: toNumber(searchParams.priceMin),
    priceMax: toNumber(searchParams.priceMax),
  };
}

export function hasActiveFilters(filters: AssetFilters): boolean {
  return (
    filters.sectors.length > 0 ||
    filters.jurisdictions.length > 0 ||
    filters.q !== "" ||
    filters.priceMin !== undefined ||
    filters.priceMax !== undefined
  );
}

/**
 * ACTIVE assets from ACTIVE sellers only — a suspended/pending/sold asset,
 * or an ACTIVE asset whose seller is suspended/removed, must not appear in
 * the Buyer-facing catalog (the seller's own /seller/assets is the one
 * place status doesn't gate visibility — see that page's comment).
 */
export function buildAssetWhere(filters: AssetFilters): Prisma.AssetWhereInput {
  const where: Prisma.AssetWhereInput = {
    status: "ACTIVE",
    seller: { status: "ACTIVE" },
  };

  if (filters.sectors.length > 0) {
    where.sector = { in: filters.sectors };
  }
  if (filters.jurisdictions.length > 0) {
    where.jurisdiction = { in: filters.jurisdictions };
  }
  if (filters.q) {
    where.OR = [
      { title: { contains: filters.q, mode: "insensitive" } },
      { description: { contains: filters.q, mode: "insensitive" } },
    ];
  }
  if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
    where.price = {
      ...(filters.priceMin !== undefined && { gte: filters.priceMin }),
      ...(filters.priceMax !== undefined && { lte: filters.priceMax }),
    };
  }

  return where;
}
