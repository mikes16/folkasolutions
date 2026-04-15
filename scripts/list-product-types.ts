/**
 * Lists distinct product types and vendors from Shopify across all products.
 * Use this to validate the static filter lists in src/lib/product-types.ts and
 * src/lib/brands.ts against real catalog data.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/list-product-types.ts
 */

export {};

const domain = process.env.SHOPIFY_STORE_DOMAIN;
const token = process.env.SHOPIFY_STOREFRONT_PUBLIC_TOKEN;

if (!domain || !token) {
  console.error("Missing SHOPIFY_STORE_DOMAIN or SHOPIFY_STOREFRONT_PUBLIC_TOKEN in .env.local");
  process.exit(1);
}

const endpoint = `https://${domain}/api/2024-10/graphql.json`;

const QUERY = `
  query ListProductTypes($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      pageInfo { hasNextPage endCursor }
      edges {
        node {
          vendor
          productType
        }
      }
    }
  }
`;

interface QueryResponse {
  data: {
    products: {
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
      edges: { node: { vendor: string; productType: string } }[];
    };
  };
  errors?: { message: string }[];
}

async function fetchPage(after: string | null): Promise<QueryResponse> {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token!,
    },
    body: JSON.stringify({
      query: QUERY,
      variables: { first: 250, after },
    }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  return res.json() as Promise<QueryResponse>;
}

async function run() {
  const types = new Map<string, number>();
  const vendors = new Map<string, number>();
  let after: string | null = null;
  let total = 0;

  while (true) {
    const json: QueryResponse = await fetchPage(after);
    if (json.errors) {
      console.error("GraphQL errors:", json.errors);
      process.exit(1);
    }
    for (const e of json.data.products.edges) {
      total += 1;
      const t = e.node.productType || "(empty)";
      const v = e.node.vendor || "(empty)";
      types.set(t, (types.get(t) ?? 0) + 1);
      vendors.set(v, (vendors.get(v) ?? 0) + 1);
    }
    if (!json.data.products.pageInfo.hasNextPage) break;
    after = json.data.products.pageInfo.endCursor;
  }

  const sortedTypes = [...types.entries()].sort((a, b) => b[1] - a[1]);
  const sortedVendors = [...vendors.entries()].sort((a, b) => b[1] - a[1]);

  console.log(`\nTotal products scanned: ${total}\n`);
  console.log("=== Product types ===");
  for (const [t, c] of sortedTypes) {
    console.log(`${String(c).padStart(4)}  ${t}`);
  }
  console.log(`\n=== Vendors ===`);
  for (const [v, c] of sortedVendors) {
    console.log(`${String(c).padStart(4)}  ${v}`);
  }
  console.log(`\nDistinct product types: ${types.size}`);
  console.log(`Distinct vendors: ${vendors.size}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
