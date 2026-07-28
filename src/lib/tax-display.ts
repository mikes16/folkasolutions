// Single flip point for how prices relate to tax across the storefront.
// Shopify is currently configured tax-exclusive: product prices are pre-IVA
// and Shopify adds 16% at checkout for Mexico. If the store ever switches to
// tax-inclusive pricing (Shopify admin: "Include tax in prices"), set
// NEXT_PUBLIC_TAX_MODE=inclusive and every surface flips its copy without
// touching components.

export type TaxMode = "exclusive" | "inclusive";

/** Mexico's IVA is a uniform nationwide 16%, so a local estimate is safe. */
export const MX_IVA_RATE = 0.16;

export function getTaxMode(): TaxMode {
  return process.env.NEXT_PUBLIC_TAX_MODE === "inclusive"
    ? "inclusive"
    : "exclusive";
}

/**
 * Whether a compact "+ IVA" note should accompany a displayed price.
 * Only Mexico gets the note: US buyers expect tax-exclusive prices, and in
 * inclusive mode the price already is the final amount.
 */
export function shouldShowTaxNote(country: string | undefined): boolean {
  return country === "MX" && getTaxMode() === "exclusive";
}
