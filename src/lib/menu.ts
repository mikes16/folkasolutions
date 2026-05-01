/**
 * Main navigation menu.
 *
 * All hrefs point to REAL Shopify collection handles verified via
 * `npx tsx --env-file=.env.local scripts/list-collections.ts`. Any change to
 * the Shopify catalog that renames or removes a handle here will 404 — re-run
 * the script to re-verify.
 *
 * Structure (4 top-level items):
 *   1. Equipment       — mega: Espresso / Grinders / Top Brands / Featured card
 *   2. Brewing         — mega: Pour-Over / Batch & Drip / Kettles & Scales
 *   3. Accessories     — mega: Barista Tools / Care & Cleaning / Cups & Glassware
 *   4. Coffee & More   — mega: Folka Coffee / Beverages / Syrups & Powders
 *
 * Catalog-wide routes ("Shop all", "All brands index") and editorial routes
 * (`/journal`, `/stories`) live in the footer + tail-links inside each mega
 * panel rather than crowding the top-level bar.
 */

export interface MegaMenuLink {
  labelKey: string;
  href: string;
}

export interface MegaMenuColumn {
  headingKey: string;
  /** If set, the column heading renders as a clickable "view all" link. */
  headingHref?: string;
  links: MegaMenuLink[];
}

export interface PromoCard {
  imageUrl: string;
  labelKey: string;
  sublabelKey: string;
  href: string;
}

export interface NavItem {
  labelKey: string;
  href: string;
  columns?: MegaMenuColumn[];
  promoCard?: PromoCard;
}

export const mainMenu: NavItem[] = [
  // 1. Equipment
  {
    labelKey: "equipment",
    href: "/collections/maquinaria",
    columns: [
      {
        headingKey: "espressoMachines",
        headingHref: "/collections/espresso-machines",
        links: [
          { labelKey: "home", href: "/collections/espresso-machines" },
          { labelKey: "commercial", href: "/collections/commercial-espresso-machines" },
        ],
      },
      {
        headingKey: "grinders",
        headingHref: "/collections/grinders",
        links: [
          { labelKey: "home", href: "/collections/domestic-grinders" },
          { labelKey: "commercial", href: "/collections/commercial-grinders" },
        ],
      },
      {
        headingKey: "topBrands",
        links: [
          { labelKey: "rocket", href: "/collections/rocket" },
          { labelKey: "profitec", href: "/collections/profitec" },
          { labelKey: "laMarzocco", href: "/collections/la-marzocco" },
          { labelKey: "slayer", href: "/collections/slayer" },
          { labelKey: "mazzer", href: "/collections/mazzer" },
          { labelKey: "eureka", href: "/collections/eureka" },
        ],
      },
    ],
    promoCard: {
      imageUrl: "/hero/slayer_steam_single.webp",
      labelKey: "featuredEquipmentTitle",
      sublabelKey: "featuredEquipmentSub",
      href: "/collections/slayer",
    },
  },

  // 3. Brewing
  {
    labelKey: "brewing",
    href: "/collections/brewing",
    columns: [
      {
        headingKey: "pourOver",
        headingHref: "/collections/brewing",
        links: [
          { labelKey: "chemex", href: "/collections/chemex" },
          { labelKey: "hario", href: "/collections/hario" },
          { labelKey: "kalita", href: "/collections/kalita" },
          { labelKey: "origami", href: "/collections/origami" },
          { labelKey: "orea", href: "/collections/orea-uk" },
          { labelKey: "aeropress", href: "/collections/aeropress" },
        ],
      },
      {
        headingKey: "batchDrip",
        links: [
          { labelKey: "moccamaster", href: "/collections/technivorm-moccamaster" },
          { labelKey: "bonavita", href: "/collections/bonavita" },
          { labelKey: "bunnBrewers", href: "/collections/bunn-brewers" },
          { labelKey: "fetco", href: "/collections/fetco" },
          { labelKey: "toddy", href: "/collections/toddy" },
        ],
      },
      {
        headingKey: "kettlesScales",
        links: [
          { labelKey: "scales", href: "/collections/scales" },
          { labelKey: "acaia", href: "/collections/acaia" },
          { labelKey: "fellow", href: "/collections/fellow" },
          { labelKey: "brewista", href: "/collections/brewista" },
          { labelKey: "timemore", href: "/collections/timemore" },
        ],
      },
    ],
  },

  // 4. Accessories
  {
    labelKey: "accessories",
    href: "/collections/coffee-bar-accessories",
    columns: [
      {
        headingKey: "baristaTools",
        headingHref: "/collections/coffee-bar-accessories",
        links: [
          { labelKey: "tampers", href: "/collections/tampers" },
          { labelKey: "pitchers", href: "/collections/pitchers" },
          { labelKey: "scales", href: "/collections/scales" },
          { labelKey: "tools", href: "/collections/tools-1" },
          { labelKey: "espressoParts", href: "/collections/espresso-parts" },
        ],
      },
      {
        headingKey: "careCleaning",
        headingHref: "/collections/cleaning-stuff",
        links: [
          { labelKey: "cleaning", href: "/collections/cleaning-stuff" },
          { labelKey: "urnex", href: "/collections/urnex" },
          { labelKey: "pallo", href: "/collections/pallo" },
          { labelKey: "puqpress", href: "/collections/puqpress" },
        ],
      },
      {
        headingKey: "cupsGlassware",
        links: [
          { labelKey: "kinto", href: "/collections/kinto" },
          { labelKey: "notneutral", href: "/collections/notneutral" },
          { labelKey: "createdCo", href: "/collections/created-co" },
          { labelKey: "aesir", href: "/collections/aesir" },
          { labelKey: "acme", href: "/collections/acme" },
        ],
      },
    ],
  },

  // 4. Coffee & More
  {
    labelKey: "coffeeAndMore",
    href: "/collections/cafe",
    columns: [
      {
        headingKey: "folkaCoffee",
        headingHref: "/collections/cafe",
        links: [
          { labelKey: "chiapas", href: "/collections/chiapas" },
          { labelKey: "guerrero", href: "/collections/guerrero" },
          { labelKey: "greenCoffee", href: "/collections/green-coffee" },
        ],
      },
      {
        headingKey: "beverages",
        links: [
          { labelKey: "tea", href: "/collections/tea" },
          { labelKey: "teaChai", href: "/collections/all-tea-chai" },
          { labelKey: "chai", href: "/collections/water-syrups" },
          { labelKey: "altMilks", href: "/collections/alternative-milks" },
          { labelKey: "rtd", href: "/collections/cold-brew-1" },
        ],
      },
      {
        headingKey: "syrupsPowders",
        links: [
          { labelKey: "syrups", href: "/collections/syrup" },
          { labelKey: "sauces", href: "/collections/jarabes" },
          { labelKey: "powders", href: "/collections/chocolate" },
          { labelKey: "maisonRoutin", href: "/collections/maison-routin-1883" },
          { labelKey: "dona", href: "/collections/dona" },
        ],
      },
    ],
  },
];
