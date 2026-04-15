import { BRANDS } from "@/lib/brands";
import { PRODUCT_TYPE_CATEGORIES, productTypeById } from "@/lib/product-types";
import { priceBucketById } from "@/lib/price-buckets";
import type { CurrencyCode } from "@/i18n/config";

export interface FilterState {
  brands: string[];        // Shopify vendor strings (already validated)
  typeIds: string[];       // category ids (url-safe slugs)
  priceBucketId?: string;  // single bucket id (currency-scoped)
}

export interface ShopifyProductFilter {
  productVendor?: string;
  productType?: string;
  price?: { min?: number; max?: number };
}

// ── URL → FilterState ───────────────────────────────────────

type SearchParamsLike = Record<string, string | string[] | undefined> | URLSearchParams;

function readParam(src: SearchParamsLike, key: string): string | undefined {
  if (src instanceof URLSearchParams) return src.get(key) ?? undefined;
  const raw = src[key];
  return Array.isArray(raw) ? raw[0] : raw;
}

const VALID_BRAND_VENDORS = new Set(BRANDS.map((b) => b.vendor));
const VALID_TYPE_IDS = new Set(PRODUCT_TYPE_CATEGORIES.map((c) => c.id));

export function parseFilterParams(
  src: SearchParamsLike,
  currency: CurrencyCode = "USD"
): FilterState {
  const rawBrand = readParam(src, "brand") ?? "";
  const rawType = readParam(src, "type") ?? "";
  const rawPrice = readParam(src, "price");

  const brands = rawBrand
    .split(",")
    .map((v) => v.trim())
    .filter((v) => VALID_BRAND_VENDORS.has(v));

  const typeIds = rawType
    .split(",")
    .map((v) => v.trim())
    .filter((v) => VALID_TYPE_IDS.has(v));

  const priceBucketId = rawPrice && priceBucketById(rawPrice, currency) ? rawPrice : undefined;

  return { brands, typeIds, priceBucketId };
}

export function hasActiveFilters(state: FilterState): boolean {
  return state.brands.length > 0 || state.typeIds.length > 0 || !!state.priceBucketId;
}

// ── FilterState → URLSearchParams ───────────────────────────

export function serializeFilterState(
  state: FilterState,
  baseParams?: URLSearchParams
): URLSearchParams {
  const params = new URLSearchParams(baseParams ?? new URLSearchParams());
  params.delete("brand");
  params.delete("type");
  params.delete("price");
  if (state.brands.length > 0) params.set("brand", state.brands.join(","));
  if (state.typeIds.length > 0) params.set("type", state.typeIds.join(","));
  if (state.priceBucketId) params.set("price", state.priceBucketId);
  return params;
}

// ── FilterState → Shopify products(query:) DSL (for /shop) ──

function quoteIfNeeded(value: string): string {
  return /\s/.test(value) ? `"${value}"` : value;
}

export function buildProductsQueryDSL(
  state: FilterState,
  currency: CurrencyCode = "USD"
): string | undefined {
  const clauses: string[] = [];

  if (state.brands.length > 0) {
    const brandClause = state.brands
      .map((v) => `vendor:${quoteIfNeeded(v)}`)
      .join(" OR ");
    clauses.push(state.brands.length > 1 ? `(${brandClause})` : brandClause);
  }

  if (state.typeIds.length > 0) {
    const typeClause = state.typeIds
      .map((id) => productTypeById(id)?.productType)
      .filter((t): t is string => !!t)
      .map((t) => `product_type:${quoteIfNeeded(t)}`)
      .join(" OR ");
    if (typeClause) {
      clauses.push(state.typeIds.length > 1 ? `(${typeClause})` : typeClause);
    }
  }

  if (state.priceBucketId) {
    const bucket = priceBucketById(state.priceBucketId, currency);
    if (bucket) {
      if (bucket.min !== undefined) clauses.push(`variants.price:>=${bucket.min}`);
      if (bucket.max !== undefined) clauses.push(`variants.price:<${bucket.max}`);
    }
  }

  return clauses.length > 0 ? clauses.join(" AND ") : undefined;
}

// ── FilterState → [ProductFilter!] (for /collections/[handle]) ──

export function buildCollectionFilters(
  state: FilterState,
  currency: CurrencyCode = "USD"
): ShopifyProductFilter[] {
  const filters: ShopifyProductFilter[] = [];

  for (const vendor of state.brands) {
    filters.push({ productVendor: vendor });
  }

  for (const typeId of state.typeIds) {
    const type = productTypeById(typeId)?.productType;
    if (type) filters.push({ productType: type });
  }

  if (state.priceBucketId) {
    const bucket = priceBucketById(state.priceBucketId, currency);
    if (bucket) {
      const price: { min?: number; max?: number } = {};
      if (bucket.min !== undefined) price.min = bucket.min;
      if (bucket.max !== undefined) price.max = bucket.max;
      filters.push({ price });
    }
  }

  return filters;
}
