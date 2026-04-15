const domain = process.env.SHOPIFY_STORE_DOMAIN!;
const storefrontToken = process.env.SHOPIFY_STOREFRONT_PUBLIC_TOKEN!;

const endpoint = `https://${domain}/api/2024-10/graphql.json`;

export async function shopifyFetch<T>({
  query,
  variables,
  country,
  language,
}: {
  query: string;
  variables?: Record<string, unknown>;
  country?: string;
  language?: string;
}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Shopify-Storefront-Access-Token": storefrontToken,
  };

  if (country) {
    headers["Shopify-Storefront-Country"] = country;
  }
  if (language) {
    headers["Accept-Language"] = language;
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`[Shopify] HTTP ${res.status}:`, text);
    throw new Error("Failed to fetch from Shopify");
  }

  const json = await res.json();

  if (json.errors) {
    const errorMsg = JSON.stringify(json.errors);
    console.error("[Shopify] GraphQL errors:", errorMsg);
    const err = new Error("Shopify request failed");
    (err as any).graphqlErrors = json.errors;
    throw err;
  }

  return json.data as T;
}
