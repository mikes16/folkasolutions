import type { ProductSortKey } from "./provider";

interface ShopifySortParams {
  sortKey: string;
  reverse: boolean;
}

const SORT_MAP: Record<string, ShopifySortParams> = {
  "price-asc": { sortKey: "PRICE", reverse: false },
  "price-desc": { sortKey: "PRICE", reverse: true },
  newest: { sortKey: "CREATED", reverse: true },
  title: { sortKey: "TITLE", reverse: false },
};

const DEFAULT_SORT: ShopifySortParams = {
  sortKey: "BEST_SELLING",
  reverse: false,
};

export function parseSortParam(sort: string | undefined): ShopifySortParams {
  if (!sort) return DEFAULT_SORT;
  return SORT_MAP[sort] ?? DEFAULT_SORT;
}

// Top-level products use ProductSortKeys (CREATED_AT), different from
// ProductCollectionSortKeys used inside a collection (CREATED).
interface ShopSortParams {
  sortKey: ProductSortKey;
  reverse: boolean;
}

const SHOP_SORT_MAP: Record<string, ShopSortParams> = {
  "price-asc": { sortKey: "PRICE", reverse: false },
  "price-desc": { sortKey: "PRICE", reverse: true },
  newest: { sortKey: "CREATED_AT", reverse: true },
  title: { sortKey: "TITLE", reverse: false },
};

const DEFAULT_SHOP_SORT: ShopSortParams = {
  sortKey: "BEST_SELLING",
  reverse: false,
};

export function parseShopSortParam(sort: string | undefined): ShopSortParams {
  if (!sort) return DEFAULT_SHOP_SORT;
  return SHOP_SORT_MAP[sort] ?? DEFAULT_SHOP_SORT;
}

export const SORT_OPTIONS = [
  { value: "", labelKey: "collections.sortBestSelling" },
  { value: "price-asc", labelKey: "collections.sortPriceLowHigh" },
  { value: "price-desc", labelKey: "collections.sortPriceHighLow" },
  { value: "newest", labelKey: "collections.sortNewest" },
  { value: "title", labelKey: "collections.sortTitle" },
] as const;
