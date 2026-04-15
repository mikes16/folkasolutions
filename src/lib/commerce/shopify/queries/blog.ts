import { IMAGE_FRAGMENT } from "../fragments";

export const GET_BLOG_BY_HANDLE = `
  query GetBlogByHandle($handle: String!, $first: Int = 20, $after: String, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    blog(handle: $handle) {
      id
      handle
      title
      articles(first: $first, after: $after, sortKey: PUBLISHED_AT, reverse: true) {
        edges {
          node {
            id
            handle
            title
            excerpt
            contentHtml
            image {
              ...ImageFragment
            }
            authorV2 {
              name
            }
            publishedAt
            tags
            seo {
              title
              description
            }
            blog {
              handle
              title
            }
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
  ${IMAGE_FRAGMENT}
`;

export const GET_ARTICLE_BY_HANDLE = `
  query GetArticleByHandle($blogHandle: String!, $articleHandle: String!, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    blog(handle: $blogHandle) {
      articleByHandle(handle: $articleHandle) {
        id
        handle
        title
        excerpt
        contentHtml
        image {
          ...ImageFragment
        }
        authorV2 {
          name
        }
        publishedAt
        tags
        seo {
          title
          description
        }
        blog {
          handle
          title
        }
      }
    }
  }
  ${IMAGE_FRAGMENT}
`;
