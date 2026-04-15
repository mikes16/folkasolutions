import { PRODUCT_FRAGMENT, IMAGE_FRAGMENT } from "../fragments";

export const GET_COLLECTION_BY_HANDLE = `
  query GetCollectionByHandle(
    $handle: String!
    $first: Int = 20
    $after: String
    $sortKey: ProductCollectionSortKeys = BEST_SELLING
    $reverse: Boolean = false
    $filters: [ProductFilter!]
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      descriptionHtml
      image {
        ...ImageFragment
      }
      seo {
        title
        description
      }
      products(first: $first, after: $after, sortKey: $sortKey, reverse: $reverse, filters: $filters) {
        edges {
          node {
            ...ProductFragment
          }
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          endCursor
          startCursor
        }
      }
    }
  }
  ${PRODUCT_FRAGMENT}
`;

export const GET_COLLECTION_FACETS = `
  query GetCollectionFacets(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      products(first: 250) {
        edges {
          node {
            vendor
            productType
          }
        }
      }
    }
  }
`;

export const GET_COLLECTIONS = `
  query GetCollections($first: Int = 20, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    collections(first: $first, sortKey: TITLE) {
      edges {
        node {
          id
          handle
          title
          description
          image {
            ...ImageFragment
          }
          products(first: 1) {
            edges {
              node {
                featuredImage {
                  ...ImageFragment
                }
              }
            }
          }
        }
      }
    }
  }
  ${IMAGE_FRAGMENT}
`;
