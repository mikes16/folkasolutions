import type { MetadataRoute } from "next";
import { commerce } from "@/lib/commerce";
import { locales } from "@/i18n/config";
import { siteConfig } from "@/lib/site-config";

const baseUrl = siteConfig.siteUrl;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, collections] = await Promise.all([
    commerce.getProducts({ first: 250 }),
    commerce.getCollections({ first: 50 }),
  ]);

  const entries: MetadataRoute.Sitemap = [];

  // Homepage per locale
  for (const locale of locales) {
    entries.push({
      url: `${baseUrl}/${locale}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${baseUrl}/${l}`])
        ),
      },
    });
  }

  // Products
  for (const product of products) {
    for (const locale of locales) {
      entries.push({
        url: `${baseUrl}/${locale}/products/${product.handle}`,
        lastModified: new Date(product.updatedAt),
        changeFrequency: "weekly",
        priority: 0.8,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${baseUrl}/${l}/products/${product.handle}`])
          ),
        },
      });
    }
  }

  // Collections
  for (const collection of collections) {
    for (const locale of locales) {
      entries.push({
        url: `${baseUrl}/${locale}/collections/${collection.handle}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${baseUrl}/${l}/collections/${collection.handle}`])
          ),
        },
      });
    }
  }

  // Blog
  try {
    const blog = await commerce.getBlog("news", { first: 100 });
    if (blog) {
      for (const article of blog.articles) {
        for (const locale of locales) {
          entries.push({
            url: `${baseUrl}/${locale}/blogs/news/${article.handle}`,
            lastModified: new Date(article.publishedAt),
            changeFrequency: "monthly",
            priority: 0.6,
            alternates: {
              languages: Object.fromEntries(
                locales.map((l) => [l, `${baseUrl}/${l}/blogs/news/${article.handle}`])
              ),
            },
          });
        }
      }
    }
  } catch {
    // Blog may not exist yet
  }

  return entries;
}
