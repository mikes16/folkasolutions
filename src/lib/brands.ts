export interface Brand {
  vendor: string;
  displayName: string;
  href: string;
}

// Curated list of brands that have a meaningful presence in Folka's catalog.
// `vendor` must match the exact Shopify vendor string (used for filtering).
// Verified via scripts/list-product-types.ts on 2026-04-11.
export const BRANDS: Brand[] = [
  { vendor: "ROCKET ESPRESSO", displayName: "Rocket", href: "/collections/rocket" },
  { vendor: "FELLOW", displayName: "Fellow", href: "/collections/fellow" },
  { vendor: "MAHLKÖNIG", displayName: "Mahlkönig", href: "/collections/mahlkonig" },
  { vendor: "ACAIA", displayName: "Acaia", href: "/collections/acaia" },
  { vendor: "MAZZER", displayName: "Mazzer", href: "/collections/mazzer" },
  { vendor: "SLAYER", displayName: "Slayer", href: "/collections/slayer" },
  { vendor: "BREVILLE", displayName: "Breville", href: "/collections/breville" },
  { vendor: "EUREKA", displayName: "Eureka", href: "/collections/eureka" },
  { vendor: "ACME", displayName: "Acme", href: "/collections/acme" },
  { vendor: "CHEMEX", displayName: "Chemex", href: "/collections/chemex" },
  { vendor: "CASADIO", displayName: "Casadio", href: "/collections/casadio" },
  { vendor: "FAEMA", displayName: "Faema", href: "/collections/faema" },
];
