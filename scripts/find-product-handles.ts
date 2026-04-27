export {};

const domain = process.env.SHOPIFY_STORE_DOMAIN;
const token = process.env.SHOPIFY_STOREFRONT_PUBLIC_TOKEN;

(async () => {
  // Search products by relevant terms
  const queries = ["nucleus", "link", "xbloom", "x bloom"];
  const seen = new Set<string>();
  for (const q of queries) {
    const res = await fetch(`https://${domain}/api/2024-10/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": token!,
      },
      body: JSON.stringify({
        query: `query Q($q: String!) {
          products(first: 20, query: $q) {
            edges {
              node {
                handle
                title
                vendor
              }
            }
          }
        }`,
        variables: { q },
      }),
    });
    const json = (await res.json()) as {
      data: { products: { edges: { node: { handle: string; title: string; vendor: string } }[] } };
    };
    console.log(`\n--- Search: "${q}" ---`);
    for (const e of json.data.products.edges) {
      if (seen.has(e.node.handle)) continue;
      seen.add(e.node.handle);
      console.log(`  ${e.node.vendor.padEnd(25)} ${e.node.handle.padEnd(45)} ${e.node.title}`);
    }
  }
})();