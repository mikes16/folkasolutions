// Normalized commerce types — backend-agnostic

export interface Money {
  amount: string;
  currencyCode: string;
}

export interface Image {
  url: string;
  altText: string;
  width: number;
  height: number;
}

export interface SEO {
  title: string;
  description: string;
}

// ── Product ──────────────────────────────────────────────

export interface ProductOption {
  id: string;
  name: string;
  values: string[];
}

export interface ProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  price: Money;
  compareAtPrice: Money | null;
  selectedOptions: { name: string; value: string }[];
  image?: Image;
}

export interface Product {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  vendor: string;
  productType: string;
  tags: string[];
  availableForSale: boolean;
  options: ProductOption[];
  variants: ProductVariant[];
  images: Image[];
  featuredImage: Image | null;
  seo: SEO;
  createdAt: string;
  updatedAt: string;
}

// ── Collection ───────────────────────────────────────────

export interface Collection {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  image: Image | null;
  seo: SEO;
  products: Product[];
  pageInfo: PageInfo;
}

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  endCursor: string | null;
  startCursor: string | null;
}

// ── Cart ─────────────────────────────────────────────────

export interface CartLineInput {
  merchandiseId: string;
  quantity: number;
}

export interface CartLine {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    product: {
      handle: string;
      title: string;
      featuredImage: Image | null;
    };
    price: Money;
    selectedOptions: { name: string; value: string }[];
  };
  cost: {
    totalAmount: Money;
  };
}

export interface Cart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  lines: CartLine[];
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
    totalTaxAmount: Money | null;
  };
}

// ── Blog ─────────────────────────────────────────────────

export interface ArticleAuthor {
  name: string;
}

export interface Article {
  id: string;
  handle: string;
  title: string;
  excerpt: string;
  contentHtml: string;
  image: Image | null;
  author: ArticleAuthor;
  publishedAt: string;
  tags: string[];
  seo: SEO;
  blog: {
    handle: string;
    title: string;
  };
}

export interface Blog {
  id: string;
  handle: string;
  title: string;
  articles: Article[];
  pageInfo: PageInfo;
}

// ── Page (CMS) ───────────────────────────────────────────

export interface Page {
  id: string;
  handle: string;
  title: string;
  body: string;
  bodySummary: string;
  seo: SEO;
  createdAt: string;
  updatedAt: string;
}

// ── Menu / Navigation ────────────────────────────────────

export interface MenuItem {
  title: string;
  url: string;
  items: MenuItem[];
}

export interface Menu {
  items: MenuItem[];
}
