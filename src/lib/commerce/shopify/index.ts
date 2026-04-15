import type {
  CollectionFacets,
  CommerceProvider,
  GetCollectionOptions,
  LocaleOptions,
  ProductSortKey,
  ProductsPage,
} from "../provider";
import type { FilterState } from "../filters";
import { buildCollectionFilters, buildProductsQueryDSL } from "../filters";
import type { Product, Collection, Cart, CartLineInput, Menu, Blog, Article, Page } from "../types";
import { shopifyFetch } from "./client";
import { mapProduct, mapCollection, mapCart, mapMenu, mapBlog, mapSingleArticle, mapPage } from "./mappers";
import { GET_PRODUCT_BY_HANDLE, GET_PRODUCTS, GET_PRODUCTS_PAGE, SEARCH_PRODUCTS } from "./queries/product";
import {
  GET_COLLECTION_BY_HANDLE,
  GET_COLLECTION_FACETS,
  GET_COLLECTIONS,
} from "./queries/collection";
import { GET_CART } from "./queries/cart";
import { GET_MENU } from "./queries/menu";
import { GET_BLOG_BY_HANDLE, GET_ARTICLE_BY_HANDLE } from "./queries/blog";
import { GET_PAGE_BY_HANDLE } from "./queries/page";
import { CREATE_CART, ADD_TO_CART, UPDATE_CART_LINES, REMOVE_FROM_CART } from "./mutations/cart";
import { UserError } from "../errors";

export const shopifyProvider: CommerceProvider = {
  // ── Products ─────────────────────────────────────────

  async getProduct(handle: string, options?: LocaleOptions): Promise<Product | null> {
    const data = await shopifyFetch<{ product: any }>({
      query: GET_PRODUCT_BY_HANDLE,
      variables: { handle, country: options?.country, language: options?.language },
      country: options?.country,
      language: options?.language,
    });
    return data.product ? mapProduct(data.product) : null;
  },

  async getProducts(
    options?: LocaleOptions & {
      first?: number;
      query?: string;
      sortKey?: ProductSortKey;
      reverse?: boolean;
    }
  ): Promise<Product[]> {
    const data = await shopifyFetch<{ products: { edges: { node: any }[] } }>({
      query: GET_PRODUCTS,
      variables: {
        first: options?.first ?? 20,
        query: options?.query,
        sortKey: options?.sortKey ?? "BEST_SELLING",
        reverse: options?.reverse ?? false,
        country: options?.country,
        language: options?.language,
      },
      country: options?.country,
      language: options?.language,
    });
    return data.products.edges.map((e) => mapProduct(e.node));
  },

  async getProductsPage(
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
  ): Promise<ProductsPage> {
    const useBackward = typeof options?.before === "string" || typeof options?.last === "number";
    const currency = options?.country === "MX" ? "MXN" : "USD";
    const filterDSL = options?.filters ? buildProductsQueryDSL(options.filters, currency) : undefined;
    const mergedQuery = [options?.query, filterDSL].filter(Boolean).join(" AND ") || undefined;
    const data = await shopifyFetch<{
      products: {
        edges: { node: any }[];
        pageInfo: {
          hasNextPage: boolean;
          hasPreviousPage: boolean;
          startCursor: string | null;
          endCursor: string | null;
        };
      };
    }>({
      query: GET_PRODUCTS_PAGE,
      variables: {
        first: useBackward ? null : options?.first ?? 24,
        last: useBackward ? options?.last ?? 24 : null,
        after: options?.after ?? null,
        before: options?.before ?? null,
        query: mergedQuery,
        sortKey: options?.sortKey ?? "BEST_SELLING",
        reverse: options?.reverse ?? false,
        country: options?.country,
        language: options?.language,
      },
      country: options?.country,
      language: options?.language,
    });
    return {
      products: data.products.edges.map((e) => mapProduct(e.node)),
      pageInfo: data.products.pageInfo,
    };
  },

  // ── Collections ──────────────────────────────────────

  async getCollection(
    handle: string,
    options?: GetCollectionOptions
  ): Promise<Collection | null> {
    const currency = options?.country === "MX" ? "MXN" : "USD";
    const productFilters = options?.filters ? buildCollectionFilters(options.filters, currency) : undefined;
    const data = await shopifyFetch<{ collection: any }>({
      query: GET_COLLECTION_BY_HANDLE,
      variables: {
        handle,
        first: options?.first ?? 20,
        after: options?.after,
        sortKey: options?.sortKey ?? "BEST_SELLING",
        reverse: options?.reverse ?? false,
        filters: productFilters && productFilters.length > 0 ? productFilters : undefined,
        country: options?.country,
        language: options?.language,
      },
      country: options?.country,
      language: options?.language,
    });
    return data.collection ? mapCollection(data.collection) : null;
  },

  async getCollectionFacets(
    handle: string,
    options?: LocaleOptions
  ): Promise<CollectionFacets> {
    const data = await shopifyFetch<{
      collection: {
        products: { edges: { node: { vendor: string; productType: string } }[] };
      } | null;
    }>({
      query: GET_COLLECTION_FACETS,
      variables: {
        handle,
        country: options?.country,
        language: options?.language,
      },
      country: options?.country,
      language: options?.language,
    });

    if (!data.collection) return { vendors: [], productTypes: [] };

    const vendors = new Set<string>();
    const productTypes = new Set<string>();
    for (const edge of data.collection.products.edges) {
      if (edge.node.vendor) vendors.add(edge.node.vendor);
      if (edge.node.productType) productTypes.add(edge.node.productType);
    }
    return {
      vendors: [...vendors],
      productTypes: [...productTypes],
    };
  },

  async getCollections(options?: LocaleOptions & { first?: number }): Promise<Collection[]> {
    const data = await shopifyFetch<{ collections: { edges: { node: any }[] } }>({
      query: GET_COLLECTIONS,
      variables: { first: options?.first ?? 20, country: options?.country, language: options?.language },
      country: options?.country,
      language: options?.language,
    });
    return data.collections.edges
      .filter((e) => (e.node.products?.edges?.length ?? 0) > 0)
      .map((e) => {
        const firstProductImage = e.node.products?.edges?.[0]?.node?.featuredImage ?? null;
        return {
          ...e.node,
          descriptionHtml: "",
          seo: { title: e.node.title, description: e.node.description || "" },
          products: [],
          pageInfo: { hasNextPage: false, hasPreviousPage: false, endCursor: null, startCursor: null },
          image: e.node.image || firstProductImage || null,
        };
      });
  },

  // ── Cart ─────────────────────────────────────────────

  async createCart(options?: LocaleOptions): Promise<Cart> {
    const data = await shopifyFetch<{ cartCreate: { cart: any } }>({
      query: CREATE_CART,
      country: options?.country,
      language: options?.language,
    });
    return mapCart(data.cartCreate.cart);
  },

  async getCart(cartId: string): Promise<Cart | null> {
    const data = await shopifyFetch<{ cart: any }>({
      query: GET_CART,
      variables: { cartId },
    });
    return data.cart ? mapCart(data.cart) : null;
  },

  async addToCart(cartId: string, lines: CartLineInput[]): Promise<Cart> {
    const data = await shopifyFetch<{ cartLinesAdd: { cart: any; userErrors: { message: string; field?: string[] }[] } }>({
      query: ADD_TO_CART,
      variables: { cartId, lines },
    });
    if (data.cartLinesAdd.userErrors?.length) {
      throw new UserError(data.cartLinesAdd.userErrors[0].message);
    }
    return mapCart(data.cartLinesAdd.cart);
  },

  async updateCart(
    cartId: string,
    lines: { id: string; merchandiseId?: string; quantity: number }[]
  ): Promise<Cart> {
    const data = await shopifyFetch<{ cartLinesUpdate: { cart: any; userErrors: { message: string; field?: string[] }[] } }>({
      query: UPDATE_CART_LINES,
      variables: { cartId, lines },
    });
    if (data.cartLinesUpdate.userErrors?.length) {
      throw new UserError(data.cartLinesUpdate.userErrors[0].message);
    }
    return mapCart(data.cartLinesUpdate.cart);
  },

  async removeFromCart(cartId: string, lineIds: string[]): Promise<Cart> {
    const data = await shopifyFetch<{ cartLinesRemove: { cart: any } }>({
      query: REMOVE_FROM_CART,
      variables: { cartId, lineIds },
    });
    return mapCart(data.cartLinesRemove.cart);
  },

  // ── Navigation ───────────────────────────────────────

  async getMenu(handle: string, options?: LocaleOptions): Promise<Menu> {
    const data = await shopifyFetch<{ menu: any }>({
      query: GET_MENU,
      variables: { handle, country: options?.country, language: options?.language },
      country: options?.country,
      language: options?.language,
    });
    return data.menu ? mapMenu(data.menu) : { items: [] };
  },

  // ── Pages ────────────────────────────────────────────

  async getPage(handle: string, options?: LocaleOptions): Promise<Page | null> {
    const data = await shopifyFetch<{ page: any }>({
      query: GET_PAGE_BY_HANDLE,
      variables: { handle, country: options?.country, language: options?.language },
      country: options?.country,
      language: options?.language,
    });
    return data.page ? mapPage(data.page) : null;
  },

  // ── Blog ─────────────────────────────────────────────

  async getBlog(handle: string, options?: LocaleOptions & { first?: number; after?: string }): Promise<Blog | null> {
    const data = await shopifyFetch<{ blog: any }>({
      query: GET_BLOG_BY_HANDLE,
      variables: {
        handle,
        first: options?.first ?? 20,
        after: options?.after,
        country: options?.country,
        language: options?.language,
      },
      country: options?.country,
      language: options?.language,
    });
    return data.blog ? mapBlog(data.blog) : null;
  },

  async getArticle(blogHandle: string, articleHandle: string, options?: LocaleOptions): Promise<Article | null> {
    const data = await shopifyFetch<{ blog: { articleByHandle: any } | null }>({
      query: GET_ARTICLE_BY_HANDLE,
      variables: { blogHandle, articleHandle, country: options?.country, language: options?.language },
      country: options?.country,
      language: options?.language,
    });
    return data.blog?.articleByHandle ? mapSingleArticle(data.blog.articleByHandle) : null;
  },

  // ── Search ───────────────────────────────────────────

  async search(query: string, options?: LocaleOptions & { first?: number }): Promise<Product[]> {
    const data = await shopifyFetch<{ search: { edges: { node: any }[] } }>({
      query: SEARCH_PRODUCTS,
      variables: { query, first: options?.first ?? 20, country: options?.country, language: options?.language },
      country: options?.country,
      language: options?.language,
    });
    return data.search.edges.map((e) => mapProduct(e.node));
  },
};
