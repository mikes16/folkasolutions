import type {
  Product,
  ProductVariant,
  Image,
  Money,
  Cart,
  CartLine,
  Collection,
  PageInfo,
  Menu,
  Article,
  Blog,
  Page,
  MenuItem,
} from "../types";

// ── Helpers ──────────────────────────────────────────────

function removeEdges<T>(connection: { edges: { node: T }[] }): T[] {
  return connection.edges.map((edge) => edge.node);
}

/**
 * Shopify mints `checkoutUrl` using whatever is configured as the primary
 * domain in Shopify Admin. After we pointed `folkasolutions.com` at Vercel
 * (which does not host checkout), those URLs land on a Vercel page that
 * the i18n middleware then mangles into a 404 (e.g. `/en/en-us/cart/...`).
 * Rewrite to the canonical `*.myshopify.com` host so checkout actually
 * loads on Shopify's edge.
 *
 * Long-term fix: set up a dedicated checkout subdomain in Shopify (e.g.
 * `checkout.folkasolutions.com` → CNAME to `shops.myshopify.com`) and
 * configure Shopify to mint URLs there.
 */
const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN ?? "";

function rewriteCheckoutUrl(url: string): string {
  if (!url || !SHOPIFY_STORE_DOMAIN) return url;
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== SHOPIFY_STORE_DOMAIN) {
      parsed.hostname = SHOPIFY_STORE_DOMAIN;
      // Shopify Markets injects a locale prefix (e.g. `/en-us/`, `/es-mx/`,
      // or just `/en/`) on the customer-facing domain. The .myshopify.com
      // host does not serve those prefixed paths, so strip them. The cart's
      // `buyerIdentity.countryCode` still drives market pricing at checkout.
      parsed.pathname = parsed.pathname.replace(
        /^\/[a-z]{2}(-[a-z]{2})?(?=\/)/,
        "",
      );
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

function mapImage(img: any): Image {
  return {
    url: img.url,
    altText: img.altText || "",
    width: img.width || 0,
    height: img.height || 0,
  };
}

function mapMoney(money: any): Money {
  return {
    amount: money.amount,
    currencyCode: money.currencyCode,
  };
}

// ── Product ──────────────────────────────────────────────

function mapVariant(v: any): ProductVariant {
  return {
    id: v.id,
    title: v.title,
    availableForSale: v.availableForSale,
    price: mapMoney(v.price),
    compareAtPrice: v.compareAtPrice ? mapMoney(v.compareAtPrice) : null,
    selectedOptions: v.selectedOptions,
    image: v.image ? mapImage(v.image) : undefined,
  };
}

export function mapProduct(p: any): Product {
  return {
    id: p.id,
    handle: p.handle,
    title: p.title,
    description: p.description,
    descriptionHtml: p.descriptionHtml,
    vendor: p.vendor,
    productType: p.productType,
    tags: p.tags,
    availableForSale: p.availableForSale,
    options: p.options,
    variants: removeEdges(p.variants).map(mapVariant),
    images: removeEdges(p.images).map(mapImage),
    featuredImage: p.featuredImage ? mapImage(p.featuredImage) : null,
    seo: {
      title: p.seo?.title || p.title,
      description: p.seo?.description || p.description,
    },
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

// ── Collection ───────────────────────────────────────────

export function mapCollection(c: any): Collection {
  return {
    id: c.id,
    handle: c.handle,
    title: c.title,
    description: c.description || "",
    descriptionHtml: c.descriptionHtml || "",
    image: c.image ? mapImage(c.image) : null,
    seo: {
      title: c.seo?.title || c.title,
      description: c.seo?.description || c.description || "",
    },
    products: removeEdges(c.products).map(mapProduct),
    pageInfo: mapPageInfo(c.products.pageInfo),
  };
}

function mapPageInfo(pi: any): PageInfo {
  return {
    hasNextPage: pi.hasNextPage,
    hasPreviousPage: pi.hasPreviousPage,
    endCursor: pi.endCursor || null,
    startCursor: pi.startCursor || null,
  };
}

// ── Cart ─────────────────────────────────────────────────

function mapCartLine(line: any): CartLine {
  return {
    id: line.id,
    quantity: line.quantity,
    merchandise: {
      id: line.merchandise.id,
      title: line.merchandise.title,
      image: line.merchandise.image ? mapImage(line.merchandise.image) : null,
      product: {
        handle: line.merchandise.product.handle,
        title: line.merchandise.product.title,
        featuredImage: line.merchandise.product.featuredImage
          ? mapImage(line.merchandise.product.featuredImage)
          : null,
      },
      price: mapMoney(line.merchandise.price),
      selectedOptions: line.merchandise.selectedOptions,
    },
    cost: {
      totalAmount: mapMoney(line.cost.totalAmount),
    },
  };
}

export function mapCart(cart: any): Cart {
  return {
    id: cart.id,
    checkoutUrl: rewriteCheckoutUrl(cart.checkoutUrl),
    totalQuantity: cart.totalQuantity,
    buyerIdentity: {
      countryCode: cart.buyerIdentity?.countryCode ?? null,
    },
    lines: removeEdges(cart.lines).map(mapCartLine),
    cost: {
      subtotalAmount: mapMoney(cart.cost.subtotalAmount),
      totalAmount: mapMoney(cart.cost.totalAmount),
      totalTaxAmount: cart.cost.totalTaxAmount
        ? mapMoney(cart.cost.totalTaxAmount)
        : null,
    },
  };
}

// ── Blog ────────────────────────────────────────────────

function mapArticle(a: any): Article {
  return {
    id: a.id,
    handle: a.handle,
    title: a.title,
    excerpt: a.excerpt || "",
    contentHtml: a.contentHtml,
    image: a.image ? mapImage(a.image) : null,
    author: { name: a.authorV2?.name || "" },
    publishedAt: a.publishedAt,
    tags: a.tags || [],
    seo: {
      title: a.seo?.title || a.title,
      description: a.seo?.description || a.excerpt || "",
    },
    blog: {
      handle: a.blog.handle,
      title: a.blog.title,
    },
  };
}

export function mapBlog(b: any): Blog {
  return {
    id: b.id,
    handle: b.handle,
    title: b.title,
    articles: removeEdges(b.articles).map(mapArticle),
    pageInfo: mapPageInfo(b.articles.pageInfo),
  };
}

export function mapSingleArticle(a: any): Article {
  return mapArticle(a);
}

// ── Page ────────────────────────────────────────────────

export function mapPage(p: any): Page {
  return {
    id: p.id,
    handle: p.handle,
    title: p.title,
    body: p.body || "",
    bodySummary: p.bodySummary || "",
    seo: {
      title: p.seo?.title || p.title,
      description: p.seo?.description || p.bodySummary || "",
    },
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

// ── Menu ─────────────────────────────────────────────────

function mapMenuItem(item: any): MenuItem {
  const url = item.url
    .replace(/^https?:\/\/[^/]+/, "")
    .replace(/\/+$/, "") || "/";

  return {
    title: item.title,
    url,
    items: item.items?.map(mapMenuItem) || [],
  };
}

export function mapMenu(menu: any): Menu {
  return {
    items: menu.items.map(mapMenuItem),
  };
}
