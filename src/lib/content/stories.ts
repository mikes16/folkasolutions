import type { ComponentType } from "react";
import type { Locale } from "@/i18n/config";

/**
 * Café Spotlights — registry + loader.
 *
 * Mirrors the journal pipeline (`./journal.ts`): each entry pairs locale-keyed
 * copy with a lazy MDX body import, so the detail page bundles only
 * the story it actually renders.
 *
 * The registry intentionally starts empty in Phase 3.A (infrastructure-only).
 * Phase 3.B authors and registers the launch stories using real video
 * transcripts. The public functions (`getAllStories`, `getStory`,
 * `getAllStorySlugs`) all behave correctly with zero entries — the index
 * page renders a graceful empty state, and `generateStaticParams` returns
 * an empty array.
 *
 * URL slug vs Cloudinary publicId: the URL identifies the *café* being
 * profiled (e.g. `/stories/jardin-sucre`), while the Cloudinary publicId
 * identifies the *partnership* (e.g. `folka/stories/folka-x-jardin-sucre-main`).
 * They are intentionally different.
 *
 * Locale-invariant vs locale-specific data: fields that don't change between
 * languages (cafe metadata, video publicIds, dates, product handles) live at
 * the entry root. Only translatable copy (title, eyebrow, description, tags,
 * author, readingTimeMinutes) is keyed by locale. This avoids the drift bug
 * where someone updates ES but not EN and the EN reader sees stale data.
 *
 * CMS-swap-ready: when the registry moves to a CMS, only this file changes.
 * Consumers depend on the public function signatures, not on the registry's
 * internal shape.
 */

export interface StoryAuthor {
  /** Optional — only set if the story is authored by a named contributor. */
  name?: string;
  role?: string;
}

export interface StoryCafe {
  name: string;
  /** City name only, e.g. "Monterrey" — used for display and as JSON-LD `addressLocality`. */
  city: string;
  /** Country code, e.g. "MX" or "US" — used for display and as JSON-LD `addressCountry`. */
  country: string;
  /** Instagram handle, no URL prefix. e.g. "jardinsucre". */
  instagram?: string;
  /** Full URL including protocol. */
  website?: string;
  foundedYear?: number;
}

export interface StoryVideo {
  provider: "cloudinary";
  /** Fully qualified Cloudinary publicId, e.g. "folka/stories/folka-x-jardin-sucre-main". */
  publicId: string;
  aspect: "16:9" | "9:16";
}

export interface StoryCoverImage {
  /** Path under the `folka/` namespace, leading slash. */
  url: string;
  alt: string;
}

/** Locale-specific copy. */
export interface StoryLocaleContent {
  /** Sentence-case display title for the post hero. */
  title: string;
  /** "Café Spotlight" / "Folka X" / etc. */
  eyebrow: string;
  /** 1-2 sentence summary, used in OG metadata + index card. */
  description: string;
  tags: string[];
  /** Optional credited author (rare — most stories don't have one). */
  author?: StoryAuthor;
  /**
   * Reading time can vary per locale because Spanish and English text length
   * differ slightly for the same article.
   */
  readingTimeMinutes: number;
}

interface StoryEntry {
  slug: string;
  // Locale-invariant fields:
  /** ISO 8601 publication date (yyyy-mm-dd). */
  publishedAt: string;
  /** ISO 8601 last-updated date, if different from publishedAt. */
  updatedAt?: string;
  cafe: StoryCafe;
  coverImage: StoryCoverImage;
  /**
   * The in-detail full-length video. When absent, the detail page hero falls
   * back to the cover image. (Aleta Azul case — teaser-only at launch.)
   */
  mainVideo?: StoryVideo;
  /** The short autoplay-on-intersection teaser used by StoryCard. 9:16 vertical. */
  teaserVideo: StoryVideo;
  /** Shopify product handles to feature in the closing equipment block. */
  featuredProductHandles: string[];
  // Locale-specific copy:
  i18n: Record<Locale, StoryLocaleContent>;
  loadBody: (locale: Locale) => Promise<{ default: ComponentType }>;
}

/**
 * Flat consumer-facing shape combining locale-invariant entry fields with the
 * resolved locale-specific copy. Lets pages and components read uniformly
 * without spreading from two places.
 */
export type StorySummary = StoryLocaleContent & {
  slug: string;
  publishedAt: string;
  updatedAt?: string;
  cafe: StoryCafe;
  coverImage: StoryCoverImage;
  mainVideo?: StoryVideo;
  teaserVideo: StoryVideo;
  featuredProductHandles: string[];
};

/** Display string for a café's location, e.g. "Monterrey, MX". */
export function formatCafeLocation(cafe: StoryCafe): string {
  return `${cafe.city}, ${cafe.country}`;
}

/**
 * The registry. Phase 3.B launch set: three café spotlights authored from
 * real video transcripts (sources in `docs/stories-source/`).
 *
 * Slug ↔ Cloudinary publicId asymmetry: the URL slug names the *café*
 * (`jardin-sucre`), while the Cloudinary publicId names the *partnership*
 * (`folka-x-jardin-sucre-main`). Posters live under
 * `folka/stories/posters/folka-x-{slug}`.
 */
const STORIES_REGISTRY: StoryEntry[] = [
  {
    slug: "jardin-sucre",
    publishedAt: "2026-04-26",
    cafe: {
      name: "Jardín Sucre",
      city: "San Pedro Garza García",
      country: "MX",
      instagram: "jardinsucre.mx",
      website: "https://jardinsucre.mx",
      foundedYear: 2024,
    },
    coverImage: {
      url: "/stories/posters/folka-x-jardin-sucre",
      alt: "Samim en el obrador de Jardín Sucre, una pastelería francesa en San Pedro Garza García.",
    },
    mainVideo: {
      provider: "cloudinary",
      publicId: "folka/stories/folka-x-jardin-sucre-main",
      aspect: "9:16",
    },
    teaserVideo: {
      provider: "cloudinary",
      publicId: "folka/stories/folka-x-jardin-sucre-teaser",
      aspect: "9:16",
    },
    featuredProductHandles: [],
    i18n: {
      es: {
        title: "Jardín Sucre: una pastelería francesa que escucha al barrio",
        eyebrow: "En conversación",
        description:
          "Samim regresó de Luxemburgo a Monterrey con una idea precisa: traer la pastelería francesa sin pisar la cultura mexicana. Dos años después, Jardín Sucre opera con esa premisa.",
        tags: ["Pastelería", "Cultura", "Monterrey"],
        readingTimeMinutes: 3,
      },
      en: {
        title: "Jardín Sucre: a French pâtisserie that listens to its block",
        eyebrow: "In conversation",
        description:
          "Samim came back from Luxembourg to Monterrey with one clear idea: bring French pastry without stepping on Mexican culture. Two years in, Jardín Sucre runs on that premise.",
        tags: ["Pastry", "Culture", "Monterrey"],
        readingTimeMinutes: 3,
      },
    },
    loadBody: async (locale) => {
      if (locale === "en") {
        return import("@/content/stories/en/jardin-sucre.mdx");
      }
      return import("@/content/stories/es/jardin-sucre.mdx");
    },
  },
  {
    slug: "radical",
    publishedAt: "2026-04-26",
    cafe: {
      name: "Radical Design Co.",
      city: "Monterrey",
      country: "MX",
      instagram: "radical.mx",
      website: "https://radicaldesignco.mx",
    },
    coverImage: {
      url: "/stories/posters/folka-x-radical",
      alt: "Jorge Campos y Abraham Jaramillo, fundadores de Radical Design Co., el estudio que diseñó la identidad de Folka.",
    },
    mainVideo: {
      provider: "cloudinary",
      publicId: "folka/stories/folka-x-radical-main",
      aspect: "9:16",
    },
    teaserVideo: {
      provider: "cloudinary",
      publicId: "folka/stories/folka-x-radical-teaser",
      aspect: "9:16",
    },
    featuredProductHandles: [],
    i18n: {
      es: {
        title: "Radical Design Co.: el estudio detrás de la marca de Folka",
        eyebrow: "En conversación",
        description:
          "Jorge Campos y Abraham Jaramillo dirigen Radical desde Monterrey. Vienen del skate, diseñan para marcas locales y firmaron el refresh de identidad de Folka.",
        tags: ["Diseño", "Identidad", "Monterrey"],
        readingTimeMinutes: 3,
      },
      en: {
        title: "Radical Design Co.: the studio behind Folka's brand",
        eyebrow: "In conversation",
        description:
          "Jorge Campos and Abraham Jaramillo run Radical out of Monterrey. They come from skate, design for local brands, and shaped Folka's identity refresh.",
        tags: ["Design", "Identity", "Monterrey"],
        readingTimeMinutes: 3,
      },
    },
    loadBody: async (locale) => {
      if (locale === "en") {
        return import("@/content/stories/en/radical.mdx");
      }
      return import("@/content/stories/es/radical.mdx");
    },
  },
  {
    slug: "yuzo",
    publishedAt: "2026-04-26",
    cafe: {
      name: "Yuzo",
      city: "Saltillo",
      country: "MX",
      instagram: "getyuzo_",
    },
    coverImage: {
      url: "/stories/posters/folka-x-yuzo",
      alt: "Yuzo, wellness bar en Saltillo: smoothies, desayunos saludables, café y matcha.",
    },
    mainVideo: {
      provider: "cloudinary",
      publicId: "folka/stories/folka-x-yuzo-main",
      aspect: "9:16",
    },
    teaserVideo: {
      provider: "cloudinary",
      publicId: "folka/stories/folka-x-yuzo-teaser",
      aspect: "9:16",
    },
    featuredProductHandles: [],
    i18n: {
      es: {
        title: "Yuzo: un wellness bar que toma en serio el café y el matcha",
        eyebrow: "En conversación",
        description:
          "En Saltillo, Yuzo construye una barra alrededor de comer rico, saludable y rápido. La calidad del café y el matcha entró al estándar desde el primer día.",
        tags: ["Wellness bar", "Matcha", "Saltillo"],
        readingTimeMinutes: 3,
      },
      en: {
        title: "Yuzo: a wellness bar that takes coffee and matcha seriously",
        eyebrow: "In conversation",
        description:
          "In Saltillo, Yuzo builds its bar around eating well, healthy, and fast. Coffee and matcha quality joined the standard from day one.",
        tags: ["Wellness bar", "Matcha", "Saltillo"],
        readingTimeMinutes: 3,
      },
    },
    loadBody: async (locale) => {
      if (locale === "en") {
        return import("@/content/stories/en/yuzo.mdx");
      }
      return import("@/content/stories/es/yuzo.mdx");
    },
  },
];

/** Composes a flat `StorySummary` from an entry + locale. */
function toSummary(entry: StoryEntry, locale: Locale): StorySummary {
  return {
    slug: entry.slug,
    publishedAt: entry.publishedAt,
    updatedAt: entry.updatedAt,
    cafe: entry.cafe,
    coverImage: entry.coverImage,
    mainVideo: entry.mainVideo,
    teaserVideo: entry.teaserVideo,
    featuredProductHandles: entry.featuredProductHandles,
    ...entry.i18n[locale],
  };
}

/**
 * Returns story summaries for the given locale, sorted newest first.
 *
 * Async even though sync today — keeps the signature stable for a future
 * CMS swap where the registry becomes a fetch().
 */
export async function getAllStories(
  locale: Locale,
): Promise<StorySummary[]> {
  return STORIES_REGISTRY.map((entry) => toSummary(entry, locale)).sort(
    (a, b) => b.publishedAt.localeCompare(a.publishedAt),
  );
}

/**
 * Returns a single story (flat summary + lazy-loaded MDX body component) for
 * the given slug/locale. Returns `null` for unknown slugs so the page can
 * call `notFound()`.
 *
 * Async even though sync today — keeps the signature stable for a future
 * CMS swap where the registry becomes a fetch().
 */
export async function getStory(
  slug: string,
  locale: Locale,
): Promise<{ frontmatter: StorySummary; Body: ComponentType } | null> {
  const entry = STORIES_REGISTRY.find((candidate) => candidate.slug === slug);
  if (!entry) return null;
  const { default: Body } = await entry.loadBody(locale);
  return { frontmatter: toSummary(entry, locale), Body };
}

/**
 * Returns every known slug — used by `generateStaticParams`.
 *
 * Async-shaped sibling of the loaders above isn't needed here because slugs
 * are locale-invariant; this stays sync.
 */
export function getAllStorySlugs(): string[] {
  return STORIES_REGISTRY.map((entry) => entry.slug);
}
