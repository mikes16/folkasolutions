import type {
  Product,
  Collection,
  Cart,
  CartLineInput,
  Menu,
  Blog,
  Article,
  Page,
  PageInfo,
} from "./types";
import type { FilterState } from "./filters";

export type ProductSortKey =
  | "BEST_SELLING"
  | "CREATED_AT"
  | "TITLE"
  | "PRICE"
  | "UPDATED_AT";

export interface ProductsPage {
  products: Product[];
  pageInfo: PageInfo;
}

export interface CollectionFacets {
  vendors: string[];
  productTypes: string[];
}

export interface LocaleOptions {
  country?: string;
  language?: string;
}

export interface GetCollectionOptions extends LocaleOptions {
  first?: number;
  after?: string;
  sortKey?: string;
  reverse?: boolean;
  filters?: FilterState;
}

export interface CommerceProvider {
  // Products
  getProduct(handle: string, options?: LocaleOptions): Promise<Product | null>;
  getProducts(
    options?: LocaleOptions & {
      first?: number;
      query?: string;
      sortKey?: ProductSortKey;
      reverse?: boolean;
    }
  ): Promise<Product[]>;
  getProductsPage(
    options?: LocaleOptions & {
      first?: number;
      last?: number;
      after?: string;
      before?: string;
      query?: string;
      sortKey?: ProductSortKey;
      reverse?: boolean;
      filters?: FilterState;
    }
  ): Promise<ProductsPage>;

  // Collections
  getCollection(
    handle: string,
    options?: GetCollectionOptions
  ): Promise<Collection | null>;
  getCollections(options?: LocaleOptions & { first?: number }): Promise<Collection[]>;
  getCollectionFacets(
    handle: string,
    options?: LocaleOptions
  ): Promise<CollectionFacets>;

  // Cart
  createCart(options?: LocaleOptions): Promise<Cart>;
  getCart(cartId: string): Promise<Cart | null>;
  addToCart(cartId: string, lines: CartLineInput[]): Promise<Cart>;
  updateCart(
    cartId: string,
    lines: { id: string; merchandiseId?: string; quantity: number }[]
  ): Promise<Cart>;
  removeFromCart(cartId: string, lineIds: string[]): Promise<Cart>;

  // Navigation
  getMenu(handle: string, options?: LocaleOptions): Promise<Menu>;

  // Blog
  getBlog(handle: string, options?: LocaleOptions & { first?: number; after?: string }): Promise<Blog | null>;
  getArticle(blogHandle: string, articleHandle: string, options?: LocaleOptions): Promise<Article | null>;

  // Pages
  getPage(handle: string, options?: LocaleOptions): Promise<Page | null>;

  // Search
  search(query: string, options?: LocaleOptions & { first?: number }): Promise<Product[]>;
}
