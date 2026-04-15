import type { Article, Collection } from "@/lib/commerce/types";
import { siteConfig } from "@/lib/site-config";

const SITE_URL = siteConfig.siteUrl;
const SITE_NAME = "Folka Coffee Solutions";

const PUBLISHER = {
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: {
    "@type": "ImageObject",
    url: `${SITE_URL}/logos/logo.webp`,
  },
};

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    alternateName: "Cafe Folka",
    url: SITE_URL,
    logo: `${SITE_URL}/logos/logo.webp`,
    sameAs: [siteConfig.social.instagram, siteConfig.social.linkedin],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["Spanish", "English"],
    },
    description:
      "Official importers of premium coffee equipment. Specialty coffee solutions for home and commercial use.",
  };
}

export function webSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/en/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function articleSchema(article: Article, locale: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    image: article.image?.url,
    datePublished: article.publishedAt,
    author: {
      "@type": "Person",
      name: article.author.name || SITE_NAME,
    },
    publisher: PUBLISHER,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/${locale}/blogs/${article.blog.handle}/${article.handle}`,
    },
  };
}

export function collectionSchema(
  collection: Pick<Collection, "title" | "description" | "handle">,
  locale: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: collection.title,
    description: collection.description,
    url: `${SITE_URL}/${locale}/collections/${collection.handle}`,
  };
}
