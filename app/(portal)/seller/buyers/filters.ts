import type { Prisma } from "@/lib/generated/prisma/client";
import { toArray, toNumber, toSingle, type RawSearchParams } from "@/lib/search-params";

export type BuyerSort = "match" | "updatedAt";

export interface BuyerFilters {
  sectors: string[];
  jurisdictions: string[];
  q: string;
  budgetMin?: number;
  budgetMax?: number;
  sort: BuyerSort;
}

export function parseBuyerFilters(searchParams: RawSearchParams): BuyerFilters {
  const sort = toSingle(searchParams.sort);
  return {
    sectors: toArray(searchParams.sectors),
    jurisdictions: toArray(searchParams.jurisdictions),
    q: toSingle(searchParams.q) ?? "",
    budgetMin: toNumber(searchParams.budgetMin),
    budgetMax: toNumber(searchParams.budgetMax),
    // Best match against the seller's own active listings by default (see
    // lib/matching.ts) — recency is one click away via ?sort=updatedAt.
    // (BuyerProfile has an `updatedAt`, not a `createdAt`, to sort by.)
    sort: sort === "updatedAt" ? "updatedAt" : "match",
  };
}

export function hasActiveFilters(filters: BuyerFilters): boolean {
  return (
    filters.sectors.length > 0 ||
    filters.jurisdictions.length > 0 ||
    filters.q !== "" ||
    filters.budgetMin !== undefined ||
    filters.budgetMax !== undefined ||
    filters.sort !== "match"
  );
}

/**
 * Only ACTIVE buyer accounts, per the assignment: a suspended/removed
 * buyer's profile must not appear in the Seller-facing directory.
 * budgetMin/budgetMax is an overlap test — a buyer with no stated budget at
 * all can't be matched against a budget filter, so they're excluded rather
 * than guessed at when one is applied.
 */
export function buildBuyerWhere(filters: BuyerFilters): Prisma.BuyerProfileWhereInput {
  const where: Prisma.BuyerProfileWhereInput = {
    user: { status: "ACTIVE" },
  };

  if (filters.sectors.length > 0) {
    where.sectors = { hasSome: filters.sectors };
  }
  if (filters.jurisdictions.length > 0) {
    where.jurisdictions = { hasSome: filters.jurisdictions };
  }
  if (filters.q) {
    where.OR = [
      { headline: { contains: filters.q, mode: "insensitive" } },
      { bio: { contains: filters.q, mode: "insensitive" } },
    ];
  }
  if (filters.budgetMin !== undefined) {
    where.budgetMax = { not: null, gte: filters.budgetMin };
    where.budgetMin = { not: null };
  }
  if (filters.budgetMax !== undefined) {
    where.budgetMin = { not: null, lte: filters.budgetMax };
  }

  return where;
}
