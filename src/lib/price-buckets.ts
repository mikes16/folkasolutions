import type { CurrencyCode } from "@/i18n/config";

export interface PriceBucket {
  id: string;
  labelKey: string;
  min?: number;
  max?: number;
}

// Currency-specific bucket presets. IDs are stable per currency so URLs
// validate cleanly after a locale switch — MXN ids won't match USD ids
// and will be dropped by parseFilterParams.
const USD_BUCKETS: PriceBucket[] = [
  { id: "usd-under-500", labelKey: "filters.priceUsdUnder500", max: 500 },
  { id: "usd-500-1500", labelKey: "filters.priceUsd500To1500", min: 500, max: 1500 },
  { id: "usd-1500-3000", labelKey: "filters.priceUsd1500To3000", min: 1500, max: 3000 },
  { id: "usd-over-3000", labelKey: "filters.priceUsdOver3000", min: 3000 },
];

const MXN_BUCKETS: PriceBucket[] = [
  { id: "mxn-under-10000", labelKey: "filters.priceMxnUnder10k", max: 10000 },
  { id: "mxn-10000-30000", labelKey: "filters.priceMxn10kTo30k", min: 10000, max: 30000 },
  { id: "mxn-30000-60000", labelKey: "filters.priceMxn30kTo60k", min: 30000, max: 60000 },
  { id: "mxn-over-60000", labelKey: "filters.priceMxnOver60k", min: 60000 },
];

export function priceBucketsForCurrency(currency: CurrencyCode): PriceBucket[] {
  return currency === "MXN" ? MXN_BUCKETS : USD_BUCKETS;
}

export function priceBucketById(id: string, currency: CurrencyCode): PriceBucket | undefined {
  return priceBucketsForCurrency(currency).find((b) => b.id === id);
}
