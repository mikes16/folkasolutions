export {};

const domain = process.env.SHOPIFY_STORE_DOMAIN;
const token = process.env.SHOPIFY_STOREFRONT_PUBLIC_TOKEN;

const HANDLES = ["nucleus-link-coffee-roaster", "xbloom-studio"];

(async () => {
  for (const handle of HANDLES) {
    const res = await fetch(`https://${domain}/api/2024-10/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": token!,
      },
      body: JSON.stringify({
        query: `query Q($handle: String!) {
          product(handle: $handle) {
            handle
            title
            vendor
            productType
            availableForSale
            priceRange { minVariantPrice { amount currencyCode } }
          }
        }`,
        variables: { handle },
      }),
    });
    const json = (await res.json()) as { data: { product: any } };
    if (!json.data?.product) {
      console.log(`❌ ${handle} — NOT FOUND`);
    } else {
      const p = json.data.product;
      console.log(
        `✓ ${p.handle.padEnd(35)} ${p.vendor.padEnd(25)} ${p.title}  ($${p.priceRange.minVariantPrice.amount} ${p.priceRange.minVariantPrice.currencyCode}, ${p.availableForSale ? "in stock" : "sold out"})`
      );
    }
  }
})();