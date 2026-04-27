/**
 * Lists products for specific vendors, including handle + title + price.
 * Use to research barista-picks curated collection.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/list-products-by-vendor.ts
 */

export {};

const domain = process.env.SHOPIFY_STORE_DOMAIN;
const token = process.env.SHOPIFY_STOREFRONT_PUBLIC_TOKEN;

if (!domain || !token) {
  console.error("Missing env vars");
  process.exit(1);
}

const endpoint = `https://${domain}/api/2024-10/graphql.json`;

const TARGET_VENDORS = [
  "SLAYER",
  "MAHLKÖNIG",
  "LELIT",
  "PROFITEC",
  "FELLOW",
  "ACAIA",
  "puqpress",
  "NICHE ZERO",
  "TECHNIVORM MOCCAMASTER",
  "AEROPRESS",
  "MAZZER",
  "EUREKA",
  "FAEMA",
  "FETCO",
  "CEADO",
  "FIORENZATO",
  "ROCKET ESPRESSO",
  "BREVILLE",
  "CASADIO",
  "CIMBALI",
];

const QUERY = `
  query Q($vendor: String!, $first: Int!) {
    products(first: $first, query: $vendor) {
      edges {
        node {
          handle
          title
          vendor
          productType
          priceRange { minVariantPrice { amount currencyCode } }
        }
      }
    }
  }
`;

interface ProductNode {
  handle: string;
  title: string;
  vendor: string;
  productType: string;
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
}

async function fetchVendor(vendor: string) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token!,
    },
    body: JSON.stringify({
      query: QUERY,
      variables: { vendor: `vendor:'${vendor}'`, first: 50 },
    }),
  });
  const json = (await res.json()) as {
    data: { products: { edges: { node: ProductNode }[] } };
    errors?: { message: string }[];
  };
  if (json.errors) {
    console.error(`[${vendor}]`, json.errors);
    return [];
  }
  return json.data.products.edges.map((e) => e.node);
}

async function run() {
  for (const v of TARGET_VENDORS) {
    const products = await fetchVendor(v);
    if (products.length === 0) {
      console.log(`\n━━━ ${v} (0 products) ━━━`);
      continue;
    }
    console.log(`\n━━━ ${v} (${products.length}) ━━━`);
    for (const p of products) {
      const price = `$${Number(p.priceRange.minVariantPrice.amount).toFixed(0)} ${p.priceRange.minVariantPrice.currencyCode}`;
      console.log(`  ${price.padEnd(16)} ${p.productType.padEnd(22)} ${p.handle}`);
      console.log(`                                          ${p.title}`);
    }
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
