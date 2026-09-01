export function formatPrice(price: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(price);
  } catch {
    // currency isn't a recognized ISO 4217 code — fall back rather than throw.
    return `${price.toLocaleString("en-US")} ${currency}`;
  }
}

export function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

/**
 * ISO 3166-1 alpha-2 code -> its flag emoji, computed rather than looked up
 * in a per-country map: each letter A-Z has a matching Unicode Regional
 * Indicator Symbol at a fixed offset, and a flag emoji is just the pair of
 * them for the two-letter code. Works for any valid code without needing
 * an SVG flag sprite/asset.
 */
export function flagEmoji(countryCode: string): string {
  return countryCode
    .toUpperCase()
    .replace(/./g, (letter) => String.fromCodePoint(127397 + letter.charCodeAt(0)));
}
