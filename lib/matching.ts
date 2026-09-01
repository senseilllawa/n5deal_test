/**
 * Pure, deterministic Buyer<->Asset match scoring — no external calls (a
 * real AI-suggestion pass is a separate, later step; this is the
 * rule-based baseline it would sit on top of, not a placeholder for it).
 */

export interface MatchableAsset {
  sector: string;
  jurisdiction: string;
  price: number;
}

export interface MatchableBuyerProfile {
  sectors: string[];
  jurisdictions: string[];
  budgetMin: number | null;
  budgetMax: number | null;
}

/** A Buyer who hasn't set up a BuyerProfile yet scores everything 0 — the
 * same as an explicitly empty one, so callers don't need a special case. */
export const EMPTY_BUYER_PROFILE: MatchableBuyerProfile = {
  sectors: [],
  jurisdictions: [],
  budgetMin: null,
  budgetMax: null,
};

/** Sector match carries the most weight (a Buyer's stated sectors are the
 * strongest signal of fit), jurisdiction next, budget least — a listing
 * priced slightly outside a stated range is still worth surfacing, a
 * listing in the wrong sector usually isn't. */
const WEIGHT = {
  sector: 50,
  jurisdiction: 30,
  budget: 20,
} as const;

/**
 * 1 when `price` is inside [min, max] (either bound may be absent, meaning
 * "no limit on that side"); otherwise decays linearly to 0 rather than
 * jumping straight there, so a price just past the edge of a Buyer's
 * stated range still scores as a near-miss instead of a hard failure.
 *
 * The falloff window ("how far past the edge does it take to reach 0") is
 * half the [min, max] span itself — proportional to the size of the
 * range the Buyer stated, rather than a fixed dollar amount that would be
 * meaningless across wildly different deal sizes. When the range is
 * one-sided (only one bound given), the window is proportional to that
 * bound instead; when it's a single point (min === max), it falls back to
 * a minimum window of 1 to avoid dividing by zero.
 */
function budgetFit(price: number, min: number | null, max: number | null): number {
  const lo = min ?? -Infinity;
  const hi = max ?? Infinity;

  if (price >= lo && price <= hi) return 1;

  const distancePastEdge = price < lo ? lo - price : price - hi;

  const span = Number.isFinite(lo) && Number.isFinite(hi) ? hi - lo : (Number.isFinite(hi) ? hi : lo);
  const window = Math.max(span * 0.5, 1);

  return Math.max(0, 1 - distancePastEdge / window);
}

/**
 * Scores how well `asset` fits `buyer`'s stated profile, 0-100.
 *
 * Each component (sector, jurisdiction, budget) only counts toward the
 * score if the Buyer actually specified something for it — an unset
 * budget doesn't cap every match at 80, it's just left out of both the
 * numerator and the denominator. A Buyer who has specified nothing at all
 * (no sectors, no jurisdictions, no budget) would make that denominator
 * zero; that's the one case handled explicitly, returning 0 rather than
 * NaN. `Asset.sector` is a single string (not an array), so "sector
 * intersection" is really membership — a Buyer interested in several
 * sectors gets full sector credit if the asset's one sector is among
 * them, not a fraction scaled by how many of their sectors it wasn't.
 */
export function scoreMatch(asset: MatchableAsset, buyer: MatchableBuyerProfile): number {
  let earned = 0;
  let possible = 0;

  if (buyer.sectors.length > 0) {
    possible += WEIGHT.sector;
    if (buyer.sectors.includes(asset.sector)) earned += WEIGHT.sector;
  }

  if (buyer.jurisdictions.length > 0) {
    possible += WEIGHT.jurisdiction;
    if (buyer.jurisdictions.includes(asset.jurisdiction)) earned += WEIGHT.jurisdiction;
  }

  if (buyer.budgetMin !== null || buyer.budgetMax !== null) {
    possible += WEIGHT.budget;
    earned += WEIGHT.budget * budgetFit(asset.price, buyer.budgetMin, buyer.budgetMax);
  }

  if (possible === 0) return 0;

  return Math.round((earned / possible) * 100);
}
