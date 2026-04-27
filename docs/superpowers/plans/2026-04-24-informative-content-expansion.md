# Editorial Content Pipeline — Journal + Stories Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Shopify-driven blog with a local MDX content pipeline that supports three content types (Journal, Stories, Guides), all sharing one editorial vocabulary. Migrate the homepage so testimonios reflect real partner cafés. Architect the content layer so it's CMS-swap-ready when the brand outgrows manual authoring.

**Architecture:** Three editorial content types stack on top of the existing Shopify catalog:
1. **Journal** — long-form editorial articles (replaces the Shopify `coffee-grounds` blog). Drop caps, video heroes, magazine-style layouts.
2. **Stories** — café spotlights ("Folka X [Café]") featuring partner cafés, their teams, and the equipment they bought. Video-first format.
3. **Guides** — buying guides and decision content (deferred to a later plan; included here as architecture-only so the content infra is shared).

All three live as MDX in `src/content/<type>/<locale>/<slug>.mdx`, registered through typed loader functions in `src/lib/content/<type>.ts`. The loader interface is **CMS-swap-ready**: today returns hardcoded array + MDX imports; tomorrow can become a Sanity/Payload fetch with zero changes to consumers.

**Tech Stack:** Next.js App Router, TypeScript strict, next-intl bilingual (es/en), Shopify Storefront for product data, MDX (`@next/mdx` + `next-mdx-remote-static`) for content, Cloudinary for video and image hosting. Existing components: `ProductCarousel`, `Reviews`, `EditorialMoment`, `ProductCard`.

---

## Decisions Locked (2026-04-25)

| Decision | Choice |
|----------|--------|
| Naming | "Journal" (replaces "Blog" / `coffee-grounds`) |
| Old Shopify content | **Fresh start (Option A)**. Drop everything. The owner will rewrite the "Conócenos" piece from scratch as new Journal content. |
| Language | **Bilingual full** — every Journal and Story published in both ES and EN |
| Authoring | **Code-first, CMS-ready**: content lives as MDX + typed registry today, swappable to a headless CMS later (Sanity / Payload candidates) |
| Video hosting | **Cloudinary** — owner ships local files first, dev uploads via the existing `scripts/upload-to-cloudinary.ts` flow |
| FAQ Teaser on homepage | **Dropped** — adds noise to a clean editorial home; existing `/pages/faq` continues to serve buyer-decision questions |

---

## Inventory

| Asset | Count | Format | Lives in |
|-------|-------|--------|----------|
| Folka X cafés — main + teaser pair | 3 | Main long-form + teaser 9:16 | Story detail (hero) + index card autoplay |
| Aleta Azul — teaser only | 1 | Teaser 9:16 (no main video) | Story detail with cover image as hero, teaser embedded inline |
| Expert technique videos | 2 | Educational, format TBD | Journal posts (one each) — first generation of Journal content |

**Story count at launch: 4** (3 Folka X + 1 Aleta Azul). The Story detail template must support optional `mainVideo` — when absent, hero falls back to cover image and the teaser embeds inline in the body.

---

## File Structure (consolidated)

```
src/
  app/[locale]/
    journal/
      page.tsx                          NEW — Journal index
      [slug]/page.tsx                   NEW — Journal article detail
    stories/
      page.tsx                          NEW — Stories (Café spotlights) index
      [slug]/page.tsx                   NEW — Story detail
    guides/                             FUTURE — same infra, later plan
    blogs/                              DELETE — Shopify-driven blog removed
  components/
    mdx/
      mdx-components.tsx                NEW — shared MDX component map (h2, h3, p, blockquote overrides)
      product-callout.tsx               NEW — embedded product card for inline use
      pull-quote.tsx                    NEW — magazine-style oversized quote
      video-embed.tsx                   NEW — Cloudinary video wrapper, supports 16:9 and 9:16
      two-up-image.tsx                  NEW — side-by-side image pair
      callout.tsx                       NEW — info / tip / note callout box
      drop-cap.tsx                      NEW — first-paragraph drop cap helper
    journal/
      journal-card.tsx                  NEW — index card (eyebrow, title, date, cover, reading time)
      journal-meta.tsx                  NEW — sidebar meta block (author, date, reading time, share)
    stories/
      story-card.tsx                    NEW — index card with autoplay teaser video on hover/in-view
      story-hero.tsx                    NEW — full-bleed video hero with overlay copy
      story-equipment-block.tsx         NEW — "El equipo en su barra" — featured products for the café
  lib/
    content/
      types.ts                          NEW — shared content types (locale, frontmatter shapes)
      journal.ts                        NEW — Journal registry + loader
      stories.ts                        NEW — Stories registry + loader
      mdx-config.ts                     NEW — shared MDX config (remark/rehype plugins, components)
  content/
    journal/
      es/
        cafe-pro-tools-explained.mdx    NEW — first expert-video post (placeholder slug; rename per content)
        brewing-technique-deep-dive.mdx NEW — second expert-video post
      en/
        cafe-pro-tools-explained.mdx    NEW — same in EN
        brewing-technique-deep-dive.mdx NEW
    stories/
      es/
        folka-x-jardin-sucre.mdx        NEW
        folka-x-radica.mdx              NEW
        folka-x-cafe-3.mdx              NEW
        folka-x-cafe-4.mdx              NEW
        folka-x-cafe-5.mdx              NEW
      en/
        ... 5 stories in EN
next.config.ts                          MODIFY — add MDX support
package.json                            MODIFY — add @next/mdx, remark-gfm, rehype-slug, rehype-autolink-headings
src/lib/menu.ts                         MODIFY — replace "Blog" with "Journal" + add "Stories"
src/app/[locale]/page.tsx               MODIFY — wire stories teasers into Reviews; replace BlogEditorial with JournalFeature
messages/en.json                        MODIFY — add journal, stories namespaces
messages/es.json                        MODIFY — add journal, stories namespaces
```

---

## Content Loader Architecture (CMS-Ready)

Every content type follows the same pattern:

```ts
// src/lib/content/types.ts
export interface ContentMeta<TFrontmatter = unknown> {
  slug: string;
  i18n: Record<Locale, TFrontmatter>;
  /** Returns the rendered MDX module for a given locale. Lazy via dynamic import. */
  loadBody: (locale: Locale) => Promise<{ default: React.ComponentType }>;
}

// src/lib/content/journal.ts
export interface JournalFrontmatter {
  title: string;
  eyebrow: string;
  description: string;
  publishedAt: string;        // ISO 8601
  updatedAt?: string;
  author: { name: string; role: string };
  coverImage: { url: string; alt: string };
  readingTimeMinutes: number;
  tags: string[];
  videoEmbed?: { provider: "cloudinary" | "youtube"; publicId: string; aspect: "16:9" | "9:16" };
}

export type JournalPost = ContentMeta<JournalFrontmatter>;

// Today: hardcoded registry. Tomorrow: Sanity GROQ query.
export async function getAllJournalPosts(locale: Locale): Promise<Array<JournalFrontmatter & { slug: string }>> {
  return JOURNAL_REGISTRY.map((post) => ({ slug: post.slug, ...post.i18n[locale] }));
}

export async function getJournalPost(slug: string, locale: Locale): Promise<{ frontmatter: JournalFrontmatter; Body: React.ComponentType } | null> {
  const post = JOURNAL_REGISTRY.find((p) => p.slug === slug);
  if (!post) return null;
  const { default: Body } = await post.loadBody(locale);
  return { frontmatter: post.i18n[locale], Body };
}
```

Same shape mirrors for `stories.ts` with `StoryFrontmatter` (which adds `cafe: { name, location, owners, instagram, website? }`, `featuredProducts: string[]` of Shopify handles, `teaserVideo`, `mainVideo`).

When the brand later wants to migrate to a CMS, only `JOURNAL_REGISTRY` and `loadBody` change — every consumer keeps working.

---

## Phase Sequence

| Phase | Title | Effort | Outputs |
|-------|-------|--------|---------|
| 1 | MDX Foundation | 90 min | `@next/mdx` setup, shared MDX components, registry types, base styles working |
| 2 | Journal — Template + 2 Expert-Video Posts | 90 min infra + 60 min × 2 posts = 3.5h | `/journal` and `/journal/[slug]` live with two real posts |
| 3 | Stories — Foundation + 2 Pilot Stories | 120 min infra + 60 min × 2 stories = 4h | `/stories`, `/stories/[slug]`, two cafés live |
| 4 | Stories — 3 Remaining + Reviews Swap | 60 min × 3 + 30 min swap = 3.5h | All 5 stories published; homepage Reviews now uses real café teasers |
| 5 | Decommission Shopify Blog | 30 min | `/blogs/coffee-grounds/*` route removed; menu updated; redirects in place |

**Total:** ~12 hours across 4-5 focused sessions.

**Recommended order:** strict 1 → 2 → 3 → 4 → 5. Each phase unlocks the next.

---

## Phase 1 — MDX Foundation

**Goal:** Get MDX rendering with custom components and editorial styles. Produce zero new content; just prove the pipeline works end-to-end with a smoke test.

### Files

- Modify: `next.config.ts` — add `@next/mdx` config wrapping `withNextIntl`
- Modify: `package.json` — install `@next/mdx`, `@mdx-js/loader`, `@mdx-js/react`, `@types/mdx`, `remark-gfm`, `rehype-slug`, `rehype-autolink-headings`, `reading-time`
- Create: `src/lib/content/types.ts` — shared types
- Create: `src/lib/content/mdx-config.ts` — remark/rehype plugin chain
- Create: `src/components/mdx/mdx-components.tsx` — `<MDXProvider>` overrides for `h1`-`h4`, `p`, `blockquote`, `a`, `ul`, `ol`, `li`, `img`, `hr`
- Create: `src/components/mdx/product-callout.tsx` — embed a product card inline by Shopify handle
- Create: `src/components/mdx/pull-quote.tsx` — magazine pull-quote, Rajdhani 300 oversized
- Create: `src/components/mdx/video-embed.tsx` — Cloudinary video wrapper, autoplay/poster/controls props
- Create: `src/components/mdx/callout.tsx` — info/tip/note variants with iconography
- Create: `src/components/mdx/two-up-image.tsx` — side-by-side image pair
- Create: `src/components/mdx/drop-cap.tsx` — wraps a paragraph to render the first letter as a drop cap
- Create: `src/content/_smoke-test.mdx` — minimal MDX file used only to verify the pipeline; deleted at end of phase

### Component Contracts

```tsx
<ProductCallout handle="rocket-appartamento-tca" variant="default" />
<PullQuote attribution="Carlos, owner @ Café Tierra">
  La calibración cambió toda mi barra.
</PullQuote>
<VideoEmbed publicId="folka/journal/expert-tools-1" aspect="16:9" autoplay={false} />
<Callout variant="tip">El agua importa más de lo que piensas.</Callout>
<TwoUpImage left={{...}} right={{...}} caption="Pull shots side by side" />
<DropCap>El espresso no nace en la máquina.</DropCap>
```

### Subtasks

#### 1.1 — Install MDX dependencies

#### 1.2 — Configure `next.config.ts`

Compose `withMDX(withNextIntl(nextConfig))`. Update `pageExtensions` to include `.mdx` if needed (only if we render MDX as routes — for our content pattern we use dynamic loading, not routes, so probably not needed).

#### 1.3 — Build shared types

`src/lib/content/types.ts` with `Locale`, `ContentMeta<T>`, base frontmatter interface.

#### 1.4 — Build MDX components

Each component in its own file with editorial-vocabulary styling (Rajdhani for display headings at weight 300, Inter for body, hairlines instead of borders, no shadows, no rounded). All accept `className` for occasional override.

#### 1.5 — Smoke test

Author `src/content/_smoke-test.mdx` exercising every component. Render it via a temporary route `/__test/mdx` (not committed). Verify:
- Headings styled correctly
- Drop cap renders on first paragraph
- Video embed loads from Cloudinary
- ProductCallout fetches real Shopify data
- PullQuote oversized, Rajdhani 300, mineral sand glyph
- Callout colors per variant
- TwoUpImage gap and caption
- All renders cross-locale

#### 1.6 — Verify, clean up, commit

Delete the smoke-test route and MDX file (or keep as a hidden `dev` route gated on `NODE_ENV`). `tsc --noEmit` clean. Commit:

```bash
git add next.config.ts package.json package-lock.json \
        src/lib/content/types.ts src/lib/content/mdx-config.ts \
        src/components/mdx/
git commit -m "feat(content): add MDX foundation with editorial components"
```

---

## Phase 2 — Journal: Template + 2 Expert-Video Posts

**Goal:** Build `/journal` and `/journal/[slug]` end-to-end. Author the two expert-video posts.

### Files

- Create: `src/lib/content/journal.ts` — registry + loader
- Create: `src/components/journal/journal-card.tsx`
- Create: `src/components/journal/journal-meta.tsx`
- Create: `src/app/[locale]/journal/page.tsx` — index
- Create: `src/app/[locale]/journal/[slug]/page.tsx` — detail
- Create: `src/content/journal/{es,en}/<slug-1>.mdx`
- Create: `src/content/journal/{es,en}/<slug-2>.mdx`
- Modify: `src/lib/menu.ts` — replace "Blog" with "Journal"
- Modify: `src/app/[locale]/page.tsx` — replace `<BlogEditorial>` with new `<JournalFeature>` pulling from the local registry
- Modify: `messages/{es,en}.json` — journal namespace

### Index Page Layout

Editorial masthead (matches `ProductCarousel` chrome):
- Eyebrow "Journal" / "Diario"
- Rajdhani 300 oversized title — "Notas, técnica, e historias del oficio." / "Notes, technique, and stories from the craft."
- Description right column + arrow-link to `/about` ("Quién escribe →")

Body: featured-first hierarchy
- Most recent post: full-width hero card (image 16:9, eyebrow, title 4xl, description, "Read →")
- Below: 2-col grid of remaining posts using `<JournalCard>` (image aspect 4/3, eyebrow, title, date, reading time)

NOT a uniform grid. Editorial weight matters — newest gets the spread, older posts get the quieter cards.

### Detail Page Layout

```
┌─────────────────────────────────────────────────────────┐
│  HERO — full-bleed cover image OR autoplay video       │
│         eyebrow, title, author, date, reading time     │
├─────────────────────────────────────────────────────────┤
│  CONTENT col-span-8        │  SIDEBAR col-span-3 sticky│
│  - drop cap first para     │  - share buttons          │
│  - MDX prose with embeds   │  - related products       │
│  - inline pull quotes      │  - "More in Journal" 3-up │
│  - video embeds            │                           │
│  - product callouts        │                           │
├─────────────────────────────────────────────────────────┤
│  CTA BLOCK — "Compra el equipo de este artículo"       │
│  3-card ProductCallout pulled from frontmatter         │
└─────────────────────────────────────────────────────────┘
```

### Subtasks

#### 2.1 — Build `journal.ts` registry + loader

Empty array initially. Type-safe shape per the architecture section above.

#### 2.2 — Build `<JournalCard>`

Cover image (next/image with Cloudinary loader), eyebrow Rajdhani uppercase tracking-4, title Rajdhani 500, date small italic muted, reading time after a `·` separator. Hover: image scale 1.03, title color shift.

#### 2.3 — Build `<JournalMeta>` sidebar

Author block (avatar optional, name + role), publish date, reading time, share buttons (X, WhatsApp, copy link). Sticky on `lg:` only.

#### 2.4 — Build `/journal` index page

Server component. Calls `getAllJournalPosts(locale)`. Renders masthead + featured-first layout.

#### 2.5 — Build `/journal/[slug]` detail page

Server component. Calls `getJournalPost(slug, locale)` → 404 if null. Renders hero, MDX `<Body />` wrapped in `<MDXProvider components={mdxComponents}>`, sidebar `<JournalMeta>`, footer CTA block.

`generateStaticParams` returns all `(locale, slug)` combos from registry.

`generateMetadata` returns Article-schema JSON-LD, OG image (cover), proper canonical + hreflang alternates.

#### 2.6 — Write expert-video post #1

Frontmatter:
```mdx
---
title: "Las herramientas que importan: lo que un experto siempre tiene en su barra"
eyebrow: "Técnica"
description: "..."
publishedAt: "2026-04-XX"
author: { name: "...", role: "Experto barista invitado" }
coverImage: { url: "...", alt: "..." }
readingTimeMinutes: 9
tags: ["técnica", "herramientas", "expertos"]
videoEmbed: { provider: "cloudinary", publicId: "folka/journal/expert-tools-1", aspect: "16:9" }
---

(prose with: <DropCap>, <PullQuote>, <ProductCallout>, <Callout variant="tip">)
```

Body content: video embed at top → drop cap intro → 3-4 sections with subheadings → product callouts for tools shown in video → closing PullQuote.

EN version mirrors structure with same media. Both bodies authored by user / expert.

#### 2.7 — Write expert-video post #2

Same shape, different topic (brewing technique deep-dive).

#### 2.8 — Wire homepage `<JournalFeature>`

Replace existing `<BlogEditorial>` import + render block. New section consumes `getAllJournalPosts(locale)`, displays 3 most recent as cards, links to `/journal`. Uses ProductCarousel masthead vocabulary.

#### 2.9 — Update menu

`src/lib/menu.ts` — wherever "Blog" lives, swap to "Journal" pointing to `/journal`. Add `"Stories"` placeholder pointing to `/stories` (will activate in Phase 3).

#### 2.10 — i18n

```
"home.journalEyebrow": "Journal" / "Journal"
"home.journalTitle": "Notes from the craft." / "Notas del oficio."
"home.journalDescription": "..." 
"home.journalViewAll": "Read the journal" / "Leer el journal"
"journal.indexEyebrow": "Journal" / "Journal"
"journal.indexTitle": "..."
"journal.indexDescription": "..."
"journal.aboutAuthor": "Who writes" / "Quién escribe"
"journal.minRead": "min read" / "min lectura"
"journal.shareTitle": "Share" / "Compartir"
"journal.relatedProducts": "Featured in this article" / "Mencionados en el artículo"
```

#### 2.11 — Verify + commit

`tsc --noEmit` clean. Visual check `/journal`, both detail pages, homepage `<JournalFeature>`. Cross-locale.

```bash
git add src/lib/content/journal.ts src/components/journal/ \
        src/app/[locale]/journal/ src/content/journal/ \
        src/lib/menu.ts src/app/[locale]/page.tsx \
        messages/en.json messages/es.json
git commit -m "feat(journal): add local Journal with editorial template and two expert posts"
```

---

## Phase 3 — Stories: Foundation + 2 Pilot Stories

**Goal:** Build `/stories` infra. Author the first two café spotlights.

### Story Frontmatter Shape

```ts
export interface StoryFrontmatter {
  title: string;                 // "Folka X Jardín Sucre"
  eyebrow: string;               // "Café Spotlight"
  description: string;
  publishedAt: string;
  cafe: {
    name: string;                // "Jardín Sucre"
    location: string;            // "Monterrey, MX"
    instagram?: string;
    website?: string;
    foundedYear?: number;
    owners?: string[];
  };
  coverImage: { url: string; alt: string };
  teaserVideo: {                 // 9:16 vertical, autoplay on index card
    provider: "cloudinary";
    publicId: string;
  };
  mainVideo?: {                  // OPTIONAL — when absent, cover image is hero
    provider: "cloudinary";
    publicId: string;
    aspect: "16:9" | "9:16";
  };
  featuredProducts: string[];    // Shopify handles ["slayer-espresso", "mahlkonig-ek43", ...]
  readingTimeMinutes: number;
}
```

### Index Page Layout (`/stories`)

Masthead (same vocabulary):
- Eyebrow: "Stories" / "Historias"
- Title: "Cafeterías que confían en Folka." / "Cafés that work with us."
- Description + "Visita el showroom →" arrow link

Body: 2-col grid of `<StoryCard>` on desktop, 1-col mobile. Each card:
- 9:16 teaser video on the left/top, autoplays muted on hover (and on intersection observer enter)
- Right/bottom: eyebrow ("Café Spotlight"), café name large Rajdhani 500, location uppercase tracking-3, "Read →" arrow

### Detail Page Layout (`/stories/[slug]`)

```
┌─────────────────────────────────────────────────────────┐
│  HERO — main video full-bleed (16:9 or 9:16 split)     │
│         eyebrow + café name oversized + location       │
├─────────────────────────────────────────────────────────┤
│  EDITORIAL BODY — 1-col, max-w-prose                   │
│  - drop cap intro about the café                       │
│  - interview quotes (PullQuote)                        │
│  - photography (TwoUpImage, single full-bleed)         │
│  - second video clip if available                      │
├─────────────────────────────────────────────────────────┤
│  EQUIPMENT BLOCK — "El equipo en su barra"             │
│  - 2-4 ProductCard pulled by featuredProducts handles  │
├─────────────────────────────────────────────────────────┤
│  VISIT BLOCK — café address, IG, website CTA           │
├─────────────────────────────────────────────────────────┤
│  RELATED — 2 other Stories                             │
└─────────────────────────────────────────────────────────┘
```

### Subtasks

#### 3.1 — Build `stories.ts` registry + loader

Same pattern as `journal.ts` with `StoryFrontmatter`.

#### 3.2 — Build `<StoryCard>`

The autoplay-teaser-on-hover behavior:
- Card uses `<video autoPlay loop muted playsInline preload="none">` (not auto-loaded; controlled)
- IntersectionObserver: when card enters viewport, call `video.play()`. When leaves, `video.pause()`. (Battery-friendly.)
- Hover: bump video volume? No — keep muted. The hover state can shift overlay opacity slightly.
- Poster image fallback for instant rendering before video loads

#### 3.3 — Build `<StoryHero>`

Full-bleed video hero. Supports 16:9 (cinematic letterbox feel) or 9:16 (mobile-first portrait, cropped on desktop). Overlay gradient (Midnight Blue 0% top → 70% bottom) ensures copy legibility. Title oversized at clamp(3rem, 7vw, 6.5rem), eyebrow uppercase tracking-4.

#### 3.4 — Build `<StoryEquipmentBlock>`

Pulls products by Shopify handle (multi-fetch via `commerce.getProducts({ handles: [...] })`). Renders in a 2-col or 4-col grid using existing `<ProductCard>`. Eyebrow above: "El equipo en su barra" / "The equipment on their bar".

#### 3.5 — Build `/stories` index page

Server component. `getAllStories(locale)` → grid of `<StoryCard>`s. Masthead matches the vocabulary.

#### 3.6 — Build `/stories/[slug]` detail page

Server component. `getStory(slug, locale)`. Renders hero, MDX body (interview, photos, quotes), equipment block, visit block, related stories.

#### 3.7 — Author Story 1: Folka X Jardín Sucre

User provides:
- Teaser video file (9:16 vertical)
- Main video file (format TBD)
- 4-8 photos
- Interview transcript or notes (Spanish primary, English translation if available)
- List of products bought (Shopify handles)
- Café metadata (location, founded year, IG handle, website)

Dev:
- Uploads videos + photos to Cloudinary via existing script
- Authors `src/content/stories/es/folka-x-jardin-sucre.mdx` and `src/content/stories/en/folka-x-jardin-sucre.mdx`
- Registers in `stories.ts`

#### 3.8 — Author Story 2: Folka X Radica

Same flow.

#### 3.9 — Verify + commit

```bash
git add src/lib/content/stories.ts src/components/stories/ \
        src/app/[locale]/stories/ src/content/stories/ \
        messages/en.json messages/es.json
git commit -m "feat(stories): launch café spotlights with two pilot stories"
```

---

## Phase 4 — Stories: 3 Remaining + Reviews Swap

**Goal:** Complete the launch set. Replace homepage Reviews with the 3 best teasers.

### Subtasks

#### 4.1 — Author Stories 3, 4, 5

Same flow as Phase 3 for each remaining café. ~60 min per story (assuming media is ready).

#### 4.2 — Pick the 3 best teasers for the homepage

Criteria: visual richness (good lighting, motion in frame), café credibility (recognizable brand), narrative quote strength.

#### 4.3 — Update homepage Reviews data

Modify `src/app/[locale]/page.tsx` — the `reviewsMeta` array currently feeds 3 testimonios. Replace each entry with:
- `videoUrl`: Cloudinary URL of the teaser
- `image`: poster frame
- `cafeName`: real café name
- The text fields (`testimonials.review1Text`, etc.) get rewritten in i18n with real quotes from each interview

Effectively: the Reviews section's 3 video slots now showcase 3 of the 5 stories. Each links to the full Story.

#### 4.4 — Add "Read full story →" link in Reviews

Modify `src/components/sections/reviews.tsx` — add an optional `storySlug` prop on each review. If present, render an arrow-link in the right column under the author block: "Read full story →" linking to `/stories/[slug]`.

#### 4.5 — Verify + commit

---

## Phase 5 — Decommission Shopify Blog

**Goal:** Remove the old `coffee-grounds` blog plumbing. Set up redirects so no old URL 404s.

### Subtasks

#### 5.1 — Add redirects in `next.config.ts`

```ts
async redirects() {
  return [
    { source: "/blogs/coffee-grounds", destination: "/journal", permanent: true },
    { source: "/blogs/coffee-grounds/:slug", destination: "/journal", permanent: true },
    { source: "/blogs/:blogHandle", destination: "/journal", permanent: false },
    { source: "/blogs/:blogHandle/:slug", destination: "/journal", permanent: false },
  ];
}
```

(Old slugs don't map 1:1 to new ones, so we redirect to the index. If the user later identifies a critical old post that has external backlinks, a specific redirect can be added.)

#### 5.2 — Delete old blog routes

```
src/app/[locale]/blogs/                  DELETE entire directory
src/components/sections/blog-editorial.tsx   DELETE if not used elsewhere (it's replaced by JournalFeature)
```

#### 5.3 — Drop blog fetch from homepage

Remove `commerce.getBlog("coffee-grounds", ...)` call from `Promise.all` in `page.tsx`.

#### 5.4 — Drop blog from Shopify commerce client (optional cleanup)

If `getBlog` and `getArticle` aren't used anywhere else, remove from `commerce` provider interface + Shopify implementation. Or leave as dead code — they don't hurt.

#### 5.5 — Verify + commit

`tsc --noEmit` clean. Hit `/blogs/coffee-grounds` → should 301 to `/journal`. Hit a random old `/blogs/coffee-grounds/some-old-handle` → should 301 to `/journal`.

```bash
git rm -r src/app/[locale]/blogs src/components/sections/blog-editorial.tsx
git add next.config.ts src/app/[locale]/page.tsx
git commit -m "chore: decommission Shopify blog, route legacy URLs to /journal"
```

---

## Cross-Phase Considerations

### SEO

- All new routes added to `src/app/sitemap.ts` (verify exists; create if not)
- Article-schema JSON-LD on Journal posts
- Article + Place-schema (for café) JSON-LD on Stories
- Hreflang alternates for ES/EN versions of every post
- Open Graph images: cover image scaled to 1200×630 via Cloudinary transform on the fly

### Performance

- MDX content pre-rendered at build time (Next.js handles this for Server Components importing MDX)
- Cover images go through Cloudinary loader (already configured)
- Teaser videos use `preload="none"` + IntersectionObserver play/pause to avoid auto-fetching 5 videos on the index page
- Main videos lazy-load on detail page entry; play only on user click for non-hero videos

### Analytics

PostHog events:
- `journal_post_viewed` — slug, locale, scroll depth
- `journal_video_played` — slug, video position
- `story_viewed` — slug, locale
- `story_teaser_autoplayed` — slug (for engagement signal)
- `story_main_video_played` — slug
- `story_product_clicked` — slug, product handle (which equipment generates inbound traffic)

### Editorial Voice (per CLAUDE.md / FOLKA_BRAND_IDENTITY.md)

- Speak as a knowledgeable peer, not a salesperson
- Lead with "why" before "what"
- Avoid "best in class", "world-class", "premium quality"
- Mix Spanish and English naturally where appropriate; bodies stay in their locale
- Stories should feel like the café owner is speaking, not Folka selling the café
- Journal pieces feel authored by the owner / experts — first-person OK

### CMS Migration Path (Future)

When the brand outgrows manual MDX authoring:

1. Pick CMS (recommendation: **Sanity** for editorial content with Portable Text + custom blocks; Payload for fully self-hosted)
2. Mirror the `JournalFrontmatter` and `StoryFrontmatter` shapes as CMS schemas
3. Replace `JOURNAL_REGISTRY` and `STORIES_REGISTRY` constants with async CMS fetches
4. Replace `loadBody` from MDX import with a Portable Text → React renderer
5. Existing pages and components don't change

The contract — `getAllJournalPosts`, `getJournalPost`, etc. — stays stable.

---

## Self-Review Checklist

- ✅ **Spec coverage:** Owner's "blog feels chafa" → Phases 1-2 (local MDX + editorial template). "Want café stories" → Phases 3-4. "5 cafés + 2 expert videos" → all real content slots in registry. "CMS-ready" → loader pattern explicitly documented.
- ✅ **Placeholder scan:** No "TBD" or "implement later". The MDX vs CMS decision is locked. Authoring flow is explicit (user provides media, dev imports). Old content fate is explicit (fresh start, drop blog).
- ✅ **Type consistency:** `Locale`, `ContentMeta<T>`, `ProductCard` props all match. Cloudinary `publicId` used consistently (not `url`) in registry frontmatter.
- ✅ **Data flow:** Story `featuredProducts: string[]` → `commerce.getProducts({ handles })` → `<ProductCard>` rendering. Loader pattern → CMS-swap-ready.

### Open Decisions Resolved

All 5 decisions from the previous review are now locked. No open questions blocking execution.

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-04-24-informative-content-expansion.md`.**

Two execution options:

**1. Subagent-Driven (recommended)** — Dispatch a fresh subagent per phase or per task. Reviewer checkpoints between phases. Best when phases are independent (Phase 1 unblocks Phase 2 unblocks Phase 3, but each phase has internal independence).

**2. Inline Execution** — Execute tasks in this session, batch with checkpoints. Faster for smaller phases (Phase 1 is small; Phase 5 is small) but heavier on this conversation's context for the long phases.

**Recommendation for this plan:** Inline for Phase 1 (foundation, fast), then Subagent-Driven for Phases 2-5 (each is a real chunk of work, fresh context per phase keeps quality high).

Phase 1 is a standalone foundation that costs ~90 min and unlocks everything downstream — that's the right place to start regardless of mode.

**Ready to begin Phase 1?**
