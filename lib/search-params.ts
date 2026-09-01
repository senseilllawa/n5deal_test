/**
 * Shared by every filters.ts that reads a Server Component's `searchParams`
 * (app/(portal)/seller/buyers, app/(portal)/buyer/assets) — the URL is the
 * source of truth for filter state (see CLAUDE.md "Server Actions vs Route
 * Handlers"), and both pages need the same string/string[]/undefined
 * normalization to get there.
 */
export type RawSearchParams = Record<string, string | string[] | undefined>;

export function toArray(value: string | string[] | undefined): string[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

export function toNumber(value: string | string[] | undefined): number | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

export function toSingle(value: string | string[] | undefined): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw?.trim() || undefined;
}
