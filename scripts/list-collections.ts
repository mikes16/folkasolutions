/**
 * Lists ALL Shopify collections with their handles, titles, and product counts.
 * Use this to plan the main navigation menu against real collection data.
 *
 * Usage:
 *   npx tsx scripts/list-collections.ts
 *   npx tsx scripts/list-collections.ts --lang es
 */

export {};

const domain = process.env.SHOPIFY_STORE_DOMAIN;
const token = process.env.SHOPIFY_STOREFRONT_PUBLIC_TOKEN;

if (!domain || !token) {
  console.error("Missing SHOPIFY_STORE_DOMAIN or SHOPIFY_STOREFRONT_PUBLIC_TOKEN in .env.local");
  process.exit(1);
}

const endpoint = `https://${domain}/api/2024-10/graphql.json`;

const args = process.argv.slice(2);
const langIndex = args.indexOf("--lang");
const language = langIndex !== -1 ? args[langIndex + 1]?.toUpperCase() : "EN";
const country = language === "ES" ? "MX" : "US";

const QUERY = `
  query ListCollections($first: Int!, $after: String, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    collections(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          handle
          title
          description
          products(first: 1) {
            edges {
              node {
                id
              }
            }
          }
        }
      }
    }
  }
`;

interface CollectionNode {
  handle: string;
  title: string;
  description: string;
  products: { edges: { node: { id: string } }[] };
}

interface QueryResponse {
  data: {
    collections: {
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
      edges: { node: CollectionNode }[];
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
      variables: { first: 250, after, country, language },
    }),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  }

  return res.json() as Promise<QueryResponse>;
}

async function listAll() {
  const all: CollectionNode[] = [];
  let after: string | null = null;

  while (true) {
    const json: QueryResponse = await fetchPage(after);
    if (json.errors) {
      console.error("GraphQL errors:", json.errors);
      process.exit(1);
    }
    all.push(...json.data.collections.edges.map((e) => e.node));
    if (!json.data.collections.pageInfo.hasNextPage) break;
    after = json.data.collections.pageInfo.endCursor;
  }

  // Sort alphabetically by handle for easy scanning
  all.sort((a, b) => a.handle.localeCompare(b.handle));

  console.log(`\nFound ${all.length} collections (${country}/${language}):\n`);
  console.log("handle".padEnd(45) + " | title");
  console.log("-".repeat(90));
  for (const c of all) {
    const hasProducts = c.products.edges.length > 0 ? "" : " [empty]";
    console.log(`${c.handle.padEnd(45)} | ${c.title}${hasProducts}`);
  }
  console.log(`\nTotal: ${all.length} collections`);
  console.log(`Empty: ${all.filter((c) => c.products.edges.length === 0).length}`);
}

listAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
