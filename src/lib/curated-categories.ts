export interface CuratedCategory {
  handle: string;
  labelKey: string;
}

export const CURATED_CATEGORIES: CuratedCategory[] = [
  { handle: "espresso-machines", labelKey: "collections.categories.espressoMachines" },
  { handle: "commercial-espresso-machines", labelKey: "collections.categories.commercialEspresso" },
  { handle: "domestic-grinders", labelKey: "collections.categories.homeGrinders" },
  { handle: "commercial-grinders", labelKey: "collections.categories.commercialGrinders" },
  { handle: "brewing", labelKey: "collections.categories.brewing" },
  { handle: "coffee-bar-accessories", labelKey: "collections.categories.accessories" },
  { handle: "drinkware", labelKey: "collections.categories.drinkware" },
  { handle: "scales", labelKey: "collections.categories.scales" },
  { handle: "cleaning-stuff", labelKey: "collections.categories.cleaning" },
  { handle: "cafe", labelKey: "collections.categories.coffee" },
  { handle: "tea", labelKey: "collections.categories.tea" },
  { handle: "syrup", labelKey: "collections.categories.syrups" },
  { handle: "merch", labelKey: "collections.categories.merch" },
];
