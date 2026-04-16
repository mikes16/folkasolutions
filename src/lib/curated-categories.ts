export interface CuratedCategory {
  handle: string;
  labelKey: string;
  descriptionKey: string;
}

export const CURATED_CATEGORIES: CuratedCategory[] = [
  {
    handle: "espresso-machines",
    labelKey: "collections.categories.espressoMachines",
    descriptionKey: "collections.descriptions.espressoMachines",
  },
  {
    handle: "commercial-espresso-machines",
    labelKey: "collections.categories.commercialEspresso",
    descriptionKey: "collections.descriptions.commercialEspresso",
  },
  {
    handle: "domestic-grinders",
    labelKey: "collections.categories.homeGrinders",
    descriptionKey: "collections.descriptions.homeGrinders",
  },
  {
    handle: "commercial-grinders",
    labelKey: "collections.categories.commercialGrinders",
    descriptionKey: "collections.descriptions.commercialGrinders",
  },
  {
    handle: "brewing",
    labelKey: "collections.categories.brewing",
    descriptionKey: "collections.descriptions.brewing",
  },
  {
    handle: "coffee-bar-accessories",
    labelKey: "collections.categories.accessories",
    descriptionKey: "collections.descriptions.accessories",
  },
  {
    handle: "drinkware",
    labelKey: "collections.categories.drinkware",
    descriptionKey: "collections.descriptions.drinkware",
  },
  {
    handle: "scales",
    labelKey: "collections.categories.scales",
    descriptionKey: "collections.descriptions.scales",
  },
  {
    handle: "cleaning-stuff",
    labelKey: "collections.categories.cleaning",
    descriptionKey: "collections.descriptions.cleaning",
  },
  {
    handle: "cafe",
    labelKey: "collections.categories.coffee",
    descriptionKey: "collections.descriptions.coffee",
  },
  {
    handle: "tea",
    labelKey: "collections.categories.tea",
    descriptionKey: "collections.descriptions.tea",
  },
  {
    handle: "syrup",
    labelKey: "collections.categories.syrups",
    descriptionKey: "collections.descriptions.syrups",
  },
  {
    handle: "merch",
    labelKey: "collections.categories.merch",
    descriptionKey: "collections.descriptions.merch",
  },
];

export function getCuratedCategory(handle: string): CuratedCategory | undefined {
  return CURATED_CATEGORIES.find((c) => c.handle === handle);
}
