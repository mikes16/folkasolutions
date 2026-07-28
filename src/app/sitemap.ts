import type { MetadataRoute } from "next";
import { commerce } from "@/lib/commerce";
import { locales, defaultLocale } from "@/i18n/config";
import { siteConfig } from "@/lib/site-config";
import { getAllStories } from "@/lib/content/stories";
import { getAllJournalPosts } from "@/lib/content/journal";

const baseUrl = siteConfig.siteUrl;

/** Shopify blog handle. Verified against the Storefront API: the store has a
 *  single blog, `coffee-grounds` — the same handle the footer links to. */
const BLOG_HANDLE = "coffee-grounds";

type SitemapEntry = MetadataRoute.Sitemap[number];

interface RouteOptions {
  /** Path after the locale segment, with a leading slash. Empty for the homepage. */
  path: string;
  lastModified: Date;
  changeFrequency: SitemapEntry["changeFrequency"];
  priority: number;
}

/**
 * Expands one logical route into a localized entry per locale, each carrying
 * the full `hreflang` alternates map. Every section below funnels through
 * this so the alternates block can never drift between route families.
 */
function localizedEntries({
  path,
  lastModified,
  changeFrequency,
  priority,
}: RouteOptions): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(
    locales.map((l) => [l, `${baseUrl}/${l}${path}`]),
  );

  return locales.map((locale) => ({
    url: `${baseUrl}/${locale}${path}`,
    lastModified,
    changeFrequency,
    priority,
    alternates: { languages },
  }));
}

/** Static routes that exist for both locales and have no content-derived date. */
const STATIC_ROUTES: Omit<RouteOptions, "lastModified">[] = [
  { path: "", changeFrequency: "daily", priority: 1 },
  { path: "/shop", changeFrequency: "daily", priority: 0.9 },
  { path: "/collections", changeFrequency: "weekly", priority: 0.8 },
  { path: "/new-arrivals", changeFrequency: "daily", priority: 0.8 },
  { path: "/stories", changeFrequency: "weekly", priority: 0.7 },
  { path: "/journal", changeFrequency: "weekly", priority: 0.7 },
  { path: "/pages/about", changeFrequency: "monthly", priority: 0.6 },
  { path: "/pages/contact", changeFrequency: "monthly", priority: 0.6 },
  { path: "/pages/faq", changeFrequency: "monthly", priority: 0.5 },
  { path: "/pages/warranty", changeFrequency: "monthly", priority: 0.5 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Slugs and publication dates are locale-invariant in both content
  // registries, so one read per registry is enough to cover every locale.
  const [products, collections, stories, journalPosts] = await Promise.all([
    commerce.getProducts({ first: 250 }),
    commerce.getCollections({ first: 50 }),
    getAllStories(defaultLocale),
    getAllJournalPosts(defaultLocale),
  ]);

  const entries: MetadataRoute.Sitemap = [
    ...STATIC_ROUTES.flatMap((route) =>
      localizedEntries({ ...route, lastModified: now }),
    ),
    ...products.flatMap((product) =>
      localizedEntries({
        path: `/products/${product.handle}`,
        lastModified: new Date(product.updatedAt),
        changeFrequency: "weekly",
        priority: 0.8,
      }),
    ),
    ...collections.flatMap((collection) =>
      localizedEntries({
        path: `/collections/${collection.handle}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.7,
      }),
    ),
    ...stories.flatMap((story) =>
      localizedEntries({
        path: `/stories/${story.slug}`,
        lastModified: new Date(story.updatedAt ?? story.publishedAt),
        changeFrequency: "monthly",
        priority: 0.6,
      }),
    ),
    ...journalPosts.flatMap((post) =>
      localizedEntries({
        path: `/journal/${post.slug}`,
        lastModified: new Date(post.updatedAt ?? post.publishedAt),
        changeFrequency: "monthly",
        priority: 0.6,
      }),
    ),
  ];

  // Shopify-hosted blog. Kept in a try/catch because the blog is editorial
  // content managed outside this repo and may be emptied or renamed there.
  try {
    const blog = await commerce.getBlog(BLOG_HANDLE, { first: 100 });
    for (const article of blog?.articles ?? []) {
      entries.push(
        ...localizedEntries({
          path: `/blogs/${BLOG_HANDLE}/${article.handle}`,
          lastModified: new Date(article.publishedAt),
          changeFrequency: "monthly",
          priority: 0.5,
        }),
      );
    }
  } catch (error) {
    console.error("[sitemap] Failed to load Shopify blog articles:", error);
  }

  return entries;
}
