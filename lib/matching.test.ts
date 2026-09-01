import { describe, expect, it } from "vitest";
import { scoreMatch } from "./matching";

const asset = { sector: "Fintech", jurisdiction: "EE", price: 150_000 };

describe("scoreMatch", () => {
  it("scores an empty profile as 0, not NaN from a 0/0 division", () => {
    expect(
      scoreMatch(asset, { sectors: [], jurisdictions: [], budgetMin: null, budgetMax: null }),
    ).toBe(0);
  });

  it("zeroes out only the budget component when price is way outside the range", () => {
    // sector + jurisdiction still match; price is nowhere near [100k, 300k].
    expect(
      scoreMatch(
        { ...asset, price: 5_000_000 },
        { sectors: ["Fintech"], jurisdictions: ["EE"], budgetMin: 100_000, budgetMax: 300_000 },
      ),
    ).toBe(80); // 50 (sector) + 30 (jurisdiction) + 0 (budget) out of 100
  });

  it("gives full sector credit on a partial intersection — one of several stated sectors matching is enough", () => {
    // Buyer is interested in two sectors; the asset only needs to be one of
    // them to earn the full sector weight, not a fraction of it.
    const score = scoreMatch(asset, {
      sectors: ["Fintech", "Payments"],
      jurisdictions: ["LT"], // deliberately not "EE", so this axis misses
      budgetMin: null,
      budgetMax: null,
    });
    // possible = 50 (sector) + 30 (jurisdiction) = 80; earned = 50 (sector
    // hit) + 0 (jurisdiction miss) = 50 -> 50/80.
    expect(score).toBe(63);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(100);
  });

  it("scores 100 on a full match across sector, jurisdiction, and budget", () => {
    expect(
      scoreMatch(asset, {
        sectors: ["Fintech"],
        jurisdictions: ["EE"],
        budgetMin: 100_000,
        budgetMax: 200_000,
      }),
    ).toBe(100);
  });

  it("decays budget fit smoothly near the edge instead of jumping straight to 0", () => {
    // 50k past a 300k max, with a 200k-wide range -> a 100k falloff window,
    // so this should land at half credit for the budget component, not 0.
    const nearMiss = scoreMatch(
      { ...asset, price: 350_000 },
      { sectors: ["Fintech"], jurisdictions: ["EE"], budgetMin: 100_000, budgetMax: 300_000 },
    );
    expect(nearMiss).toBe(90); // 50 + 30 + 20*0.5
    expect(nearMiss).toBeGreaterThan(80); // strictly better than "budget missed entirely"
    expect(nearMiss).toBeLessThan(100); // strictly worse than "budget matched"
  });

  it("doesn't let an unspecified budget cap an otherwise-perfect match", () => {
    // No budgetMin/Max at all -> that component is excluded from scoring
    // entirely (not scored as a miss), so sector+jurisdiction alone can
    // still reach 100.
    expect(
      scoreMatch(
        { ...asset, price: 999_999_999 },
        { sectors: ["Fintech"], jurisdictions: ["EE"], budgetMin: null, budgetMax: null },
      ),
    ).toBe(100);
  });
});
