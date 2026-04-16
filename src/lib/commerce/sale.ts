import type { Product } from "./types";

// Collection handles that should only display products with a real discount.
// Keep this list in sync with any Shopify collection meant to be a "sale" view.
const SALE_COLLECTION_HANDLES = new Set([
  "deals",
  "ofertas",
  "sale",
]);

export function isSaleCollectionHandle(handle: string): boolean {
  return SALE_COLLECTION_HANDLES.has(handle.toLowerCase());
}

// A product counts as on sale when at least one variant has a compareAtPrice
// strictly greater than its price. Using the already-@inContext'd prices means
// this check is market-aware automatically (MX vs US may evaluate differently).
export function isProductOnSale(product: Product): boolean {
  return product.variants.some((v) => {
    if (!v.compareAtPrice) return false;
    const compare = parseFloat(v.compareAtPrice.amount);
    const price = parseFloat(v.price.amount);
    return Number.isFinite(compare) && Number.isFinite(price) && compare > price;
  });
}
