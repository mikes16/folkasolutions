import type { Product } from "@/lib/commerce/types";
import { CURATED_CATEGORIES, type CuratedCategory } from "@/lib/curated-categories";

// Maps Shopify productType values to one of the 13 curated category handles.
// Verified against live catalog via scripts/list-product-types.ts on 2026-04-14.
// For ambiguous cases (e.g. "Espresso Machines" could be commercial or home)
// we default to the generic/home variant.
const PRODUCT_TYPE_TO_CATEGORY: Record<string, string> = {
  "Espresso Machines": "espresso-machines",
  "Coffee Grinders": "domestic-grinders",
  "Brewing Equipment": "brewing",
  "Coffee Maker": "brewing",
  "Coffee Dripper": "brewing",
  Filters: "brewing",
  Accesories: "coffee-bar-accessories",
  "Coffee Lab": "coffee-bar-accessories",
  Parts: "coffee-bar-accessories",
  Drinkware: "drinkware",
  Scales: "scales",
  Cleaning: "cleaning-stuff",
  Coffee: "cafe",
  Tea: "tea",
  Chocolate: "syrup",
  "Non-Dairy Milk": "syrup",
  Merch: "merch",
};

export function getCuratedCategoryForProduct(product: Product): CuratedCategory | null {
  const handle = PRODUCT_TYPE_TO_CATEGORY[product.productType];
  if (!handle) return null;
  return CURATED_CATEGORIES.find((c) => c.handle === handle) ?? null;
}
