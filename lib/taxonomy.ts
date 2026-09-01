/**
 * Shared domain vocabulary — single source of truth for the values used
 * across the "publish an asset" form, the buyer-directory and
 * asset-catalog filters, and the buyer-profile form, so none of them drift
 * apart. Matches the values already used in lib/demo-data/.
 */

export const SECTORS = ["Fintech", "Payments", "Lending", "Wealth Management", "Insurtech", "Crypto"] as const;

export type Sector = (typeof SECTORS)[number];

export const JURISDICTIONS: { code: string; label: string }[] = [
  { code: "EE", label: "Estonia" },
  { code: "LT", label: "Lithuania" },
  { code: "LV", label: "Latvia" },
  { code: "PL", label: "Poland" },
  { code: "MT", label: "Malta" },
];

export const JURISDICTION_CODES = JURISDICTIONS.map((j) => j.code);

export const CURRENCIES = ["EUR", "USD", "GBP", "PLN"] as const;

export type Currency = (typeof CURRENCIES)[number];

export const DEAL_TYPES = ["asset purchase", "share deal"] as const;

export type DealType = (typeof DEAL_TYPES)[number];
