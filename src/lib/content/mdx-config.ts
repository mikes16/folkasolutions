/**
 * Single source of truth for the MDX remark/rehype plugin chain.
 *
 * Imported by `next.config.ts` to configure the build-time MDX loader, and
 * available for any future runtime MDX renderer (e.g. compile-on-demand from
 * a CMS) so all editorial content goes through the same transforms.
 *
 * Plugins are identified by package name (string) rather than imported
 * functions because Next.js 16 ships Turbopack as the default builder, and
 * Turbopack requires loader options to be JSON-serializable so they can be
 * passed across the JS/Rust boundary. See:
 * node_modules/next/dist/docs/01-app/02-guides/mdx.md ("Using Plugins with
 * Turbopack").
 *
 * - `remark-gfm`: GitHub Flavored Markdown (tables, strikethrough, task lists).
 * - `rehype-slug`: assigns stable `id`s to headings.
 * - `rehype-autolink-headings`: wraps each heading in an anchor so the entire
 *   heading is the click target — better UX than tiny icon links.
 */

/** Plugin entry: either a package name, or a [name, options] tuple. */
export type MdxPluginEntry = string | readonly [name: string, options: object];

export const remarkPlugins: readonly MdxPluginEntry[] = ["remark-gfm"];

export const rehypePlugins: readonly MdxPluginEntry[] = [
  "rehype-slug",
  ["rehype-autolink-headings", { behavior: "wrap" }],
];
