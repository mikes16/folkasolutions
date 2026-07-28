/**
 * Per-brand exceptions to the PDP trust badges.
 *
 * Business decision (2026-07): the default badge set claims Folka is the
 * official importer and ships to both markets, which is true for the equipment
 * catalog but not for every brand. Philips is distributed, not imported by
 * Folka, and is only shipped inside Mexico, so those two claims have to be
 * suppressed on its product pages.
 *
 * Keys are lowercased vendor names. If this table outgrows a handful of
 * brands, move the flags to Shopify metafields on the product so the business
 * can edit them without a deploy.
 */
export interface VendorTrustOverrides {
  officialImporter?: boolean;
  shippingScope?: "mx" | "mx-us";
}

export const VENDOR_TRUST_OVERRIDES: Record<string, VendorTrustOverrides> = {
  philips: { officialImporter: false, shippingScope: "mx" },
};

const DEFAULT_TRUST_CONFIG: Required<VendorTrustOverrides> = {
  officialImporter: true,
  shippingScope: "mx-us",
};

/** Resolves the trust badge claims Folka can make for a given vendor. */
export function getTrustBadgeConfig(vendor: string): Required<VendorTrustOverrides> {
  const override = VENDOR_TRUST_OVERRIDES[vendor.trim().toLowerCase()];
  if (!override) return DEFAULT_TRUST_CONFIG;

  return { ...DEFAULT_TRUST_CONFIG, ...override };
}
