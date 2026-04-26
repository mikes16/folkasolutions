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
 * The registry. Phase 3.A ships an empty array — the infrastructure must work
 * with zero stories registered. Phase 3.B populates this with the launch set.
 */
const STORIES_REGISTRY: StoryEntry[] = [];

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
