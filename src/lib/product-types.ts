export interface ProductTypeCategory {
  id: string;
  labelKey: string;
  productType: string;
}

// Maps each category id (used in URLs) to the exact Shopify `productType`
// value. Note "Accesories" — Shopify catalog has it misspelled; do not "fix"
// it here or the filter will return zero results.
// Verified via scripts/list-product-types.ts on 2026-04-11.
export const PRODUCT_TYPE_CATEGORIES: ProductTypeCategory[] = [
  { id: "espresso-machines", labelKey: "filters.typeEspressoMachines", productType: "Espresso Machines" },
  { id: "grinders", labelKey: "filters.typeGrinders", productType: "Coffee Grinders" },
  { id: "brewing", labelKey: "filters.typeBrewing", productType: "Brewing Equipment" },
  { id: "accessories", labelKey: "filters.typeAccessories", productType: "Accesories" },
  { id: "drinkware", labelKey: "filters.typeDrinkware", productType: "Drinkware" },
  { id: "cleaning", labelKey: "filters.typeCleaning", productType: "Cleaning" },
];

export function productTypeById(id: string): ProductTypeCategory | undefined {
  return PRODUCT_TYPE_CATEGORIES.find((c) => c.id === id);
}
