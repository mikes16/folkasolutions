import type { Locale } from "@/i18n/config";
import type { ComponentType } from "react";

/**
 * Generic shape for any editorial content type (Journal, Stories, Guides).
 * Today: hardcoded array + MDX dynamic import. Tomorrow: same shape filled
 * by a CMS fetch. Consumers stay stable.
 */
export interface ContentMeta<TFrontmatter = unknown> {
  slug: string;
  i18n: Record<Locale, TFrontmatter>;
  /** Returns the rendered MDX body for the given locale. Lazy via dynamic import. */
  loadBody: (locale: Locale) => Promise<{ default: ComponentType }>;
}
