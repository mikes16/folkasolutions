import type { ComponentType } from "react";
import type { Locale } from "@/i18n/config";
import { cloudinaryUrl } from "@/lib/cloudinary";

/**
 * Editorial Journal — registry + loader.
 *
 * The registry is the single source of truth for journal posts today. Each
 * entry pairs locale-keyed frontmatter with a lazy MDX body import, so the
 * page bundles only the article it actually renders. The shape mirrors the
 * generic `ContentMeta` contract in `./types.ts`, but is specialized to
 * `JournalFrontmatter` for type safety at consumption sites.
 *
 * CMS-swap-ready: the public functions (`getAllJournalPosts`,
 * `getJournalPost`, `getAllJournalSlugs`) are pure async I/O. Today they
 * read from a hardcoded array; tomorrow they can be replaced by a Sanity,
 * Payload, or Contentlayer fetch without changing a single consumer.
 */

export interface JournalAuthor {
  name: string;
  role: string;
  affiliation?: string;
}

export interface JournalCoverImage {
  url: string;
  alt: string;
}

export interface JournalVideoEmbed {
  provider: "cloudinary";
  publicId: string;
  aspect: "16:9" | "9:16";
  /** Cloudinary path under the `folka/` namespace (leading slash, no `folka/` prefix), e.g. "/journal/posters/expert-link-roberto". */
  poster?: string;
}

export interface JournalFrontmatter {
  title: string;
  eyebrow: string;
  description: string;
  /** ISO 8601 publication date. */
  publishedAt: string;
  /** ISO 8601 last-updated date, if different from publishedAt. */
  updatedAt?: string;
  author: JournalAuthor;
  coverImage: JournalCoverImage;
  readingTimeMinutes: number;
  tags: string[];
  videoEmbed?: JournalVideoEmbed;
  /** Shopify product handles to feature in the closing CTA block. */
  featuredProductHandles: string[];
}

export type JournalSummary = JournalFrontmatter & { slug: string };

interface JournalEntry {
  slug: string;
  i18n: Record<Locale, JournalFrontmatter>;
  loadBody: (locale: Locale) => Promise<{ default: ComponentType }>;
}

const ROBERTO_COVER_URL = cloudinaryUrl("/journal/posters/expert-link-roberto");
const AVENAMAR_COVER_URL = cloudinaryUrl(
  "/journal/posters/expert-xbloom-avenamar",
);

const JOURNAL_REGISTRY: JournalEntry[] = [
  {
    slug: "roberto-nal-link-sample-roasting",
    i18n: {
      es: {
        title: "Roberto Nal y el oficio de tostar muestras",
        eyebrow: "En conversación",
        description:
          "Un tostador de Tres Fases nos habla del Link y de por qué el sample roasting decide qué cafés merecen llegar al menú.",
        publishedAt: "2026-04-25",
        author: {
          name: "Roberto Nal",
          role: "Tostador",
          affiliation: "Tres Fases Tostadores",
        },
        coverImage: {
          url: ROBERTO_COVER_URL,
          alt: "Roberto Nal junto al sample roaster Link en Tres Fases Tostadores.",
        },
        readingTimeMinutes: 3,
        tags: ["Tueste", "Calidad", "Sample roasting"],
        videoEmbed: {
          provider: "cloudinary",
          publicId: "folka/journal/expert-link-roberto",
          aspect: "9:16",
          poster: "/journal/posters/expert-link-roberto",
        },
        featuredProductHandles: ["the-link-sample-coffee-roaster"],
      },
      en: {
        title: "Roberto Nal on the craft of sample roasting",
        eyebrow: "In conversation",
        description:
          "A roaster at Tres Fases walks us through The Link, and why sample roasting is what decides which coffees make it to the menu.",
        publishedAt: "2026-04-25",
        author: {
          name: "Roberto Nal",
          role: "Roaster",
          affiliation: "Tres Fases Tostadores",
        },
        coverImage: {
          url: ROBERTO_COVER_URL,
          alt: "Roberto Nal at the Link sample roaster at Tres Fases Tostadores.",
        },
        readingTimeMinutes: 3,
        tags: ["Roasting", "Quality", "Sample roasting"],
        videoEmbed: {
          provider: "cloudinary",
          publicId: "folka/journal/expert-link-roberto",
          aspect: "9:16",
          poster: "/journal/posters/expert-link-roberto",
        },
        featuredProductHandles: ["the-link-sample-coffee-roaster"],
      },
    },
    loadBody: async (locale) => {
      if (locale === "en") {
        return import(
          "@/content/journal/en/roberto-nal-link-sample-roasting.mdx"
        );
      }
      return import(
        "@/content/journal/es/roberto-nal-link-sample-roasting.mdx"
      );
    },
  },
  {
    slug: "avenamar-gutierrez-xbloom-pour-over",
    i18n: {
      es: {
        title: "Avenamar Gutiérrez y la receta automatizada",
        eyebrow: "En conversación",
        description:
          "Un experto en calidad sobre el xBloom Studio: dónde termina el oficio del barista y dónde empieza la repetibilidad de la máquina.",
        publishedAt: "2026-04-24",
        author: {
          name: "Avenamar Gutiérrez",
          role: "Experto en calidad de café",
        },
        coverImage: {
          url: AVENAMAR_COVER_URL,
          alt: "Avenamar Gutiérrez preparando un pour-over con el xBloom Studio.",
        },
        readingTimeMinutes: 3,
        tags: ["Pour-over", "Brewing", "Calidad"],
        videoEmbed: {
          provider: "cloudinary",
          publicId: "folka/journal/expert-xbloom-avenamar",
          aspect: "9:16",
          poster: "/journal/posters/expert-xbloom-avenamar",
        },
        featuredProductHandles: ["xbloom-studio"],
      },
      en: {
        title: "Avenamar Gutiérrez on the automated recipe",
        eyebrow: "In conversation",
        description:
          "A coffee quality expert on xBloom Studio: where the barista's craft ends and where the machine's repeatability begins.",
        publishedAt: "2026-04-24",
        author: {
          name: "Avenamar Gutiérrez",
          role: "Coffee quality expert",
        },
        coverImage: {
          url: AVENAMAR_COVER_URL,
          alt: "Avenamar Gutiérrez brewing a pour-over with xBloom Studio.",
        },
        readingTimeMinutes: 3,
        tags: ["Pour-over", "Brewing", "Quality"],
        videoEmbed: {
          provider: "cloudinary",
          publicId: "folka/journal/expert-xbloom-avenamar",
          aspect: "9:16",
          poster: "/journal/posters/expert-xbloom-avenamar",
        },
        featuredProductHandles: ["xbloom-studio"],
      },
    },
    loadBody: async (locale) => {
      if (locale === "en") {
        return import(
          "@/content/journal/en/avenamar-gutierrez-xbloom-pour-over.mdx"
        );
      }
      return import(
        "@/content/journal/es/avenamar-gutierrez-xbloom-pour-over.mdx"
      );
    },
  },
];

/**
 * Returns all journal posts for the given locale, sorted by `publishedAt`
 * descending. Pure data — body MDX is not loaded here.
 */
export async function getAllJournalPosts(
  locale: Locale,
): Promise<JournalSummary[]> {
  return JOURNAL_REGISTRY.map((entry) => ({
    slug: entry.slug,
    ...entry.i18n[locale],
  })).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

/**
 * Returns a single post (frontmatter + lazy-loaded MDX body component) for
 * the given slug/locale. Returns `null` for unknown slugs so the page can
 * call `notFound()`.
 */
export async function getJournalPost(
  slug: string,
  locale: Locale,
): Promise<{ frontmatter: JournalFrontmatter; Body: ComponentType } | null> {
  const entry = JOURNAL_REGISTRY.find((candidate) => candidate.slug === slug);
  if (!entry) return null;
  const { default: Body } = await entry.loadBody(locale);
  return { frontmatter: entry.i18n[locale], Body };
}

/** Returns every known slug — used by `generateStaticParams`. */
export function getAllJournalSlugs(): string[] {
  return JOURNAL_REGISTRY.map((entry) => entry.slug);
}
