# Folka Coffee Solutions — Next.js Storefront

Next.js 16 headless storefront for **Folka Coffee Solutions / Cafe Folka** — a bilingual (ES/MX · EN/US) specialty coffee store powered by Shopify Storefront API, editorial-first design, and next-intl i18n.

- **Production reference:** [folkasolutions.com](https://folkasolutions.com) (current Shopify theme — this project replaces it)
- **Brand identity:** see [`FOLKA_BRAND_IDENTITY.md`](./FOLKA_BRAND_IDENTITY.md)
- **Engineering standards:** see [`ENGINEERING_STANDARDS.md`](./ENGINEERING_STANDARDS.md)

---

## Tech stack

| Layer | Tool |
|---|---|
| Framework | Next.js 16 (App Router, React 19) |
| Styling | Tailwind CSS v4 |
| Language | TypeScript (strict) |
| i18n | next-intl (`es`, `en`) with locale-prefixed routes |
| Commerce | Shopify Storefront API (GraphQL, `@inContext`) |
| Content validation | Zod |
| Translation pipeline | Anthropic Claude (dev script) |

---

## Project structure

```
src/
  app/
    [locale]/             # Locale-scoped routes (/es, /en)
      page.tsx            # Home
      collections/        # Category and collection pages
      products/[handle]/  # Product detail pages (PDP)
      blogs/              # Coffee Grounds blog
      pages/              # Static pages (about, contact, warranty, faq, legal)
      shop/               # Filterable catalog
      search/             # Search results
    api/                  # Route handlers (cart, products, collections)
    sitemap.ts            # Dynamic sitemap
    robots.ts
    layout.tsx            # Root layout
  components/
    cart/                 # Cart drawer + context
    collection/           # Collection context + grid
    layout/               # Header, footer, mobile menu
    legal/                # Legal document renderer
    navigation-tracker.tsx
    product/              # PDP components (gallery, info, breadcrumbs)
    ui/                   # Primitives (Icon, Breadcrumbs, buttons)
  content/
    faq.ts                # Structured bilingual FAQ content
    legal/                # Terms of Service + Refund Policy content
  i18n/
    config.ts             # Locales + country/language map
    navigation.ts         # Locale-aware Link/router
    request.ts            # next-intl request config
  lib/
    commerce/             # Shopify client + mappers + filters
    seo/schemas.ts        # JSON-LD schema helpers
    brands.ts             # Static brand registry
    curated-categories.ts # 13 category allow-list for /collections
    product-category-mapping.ts  # productType → curated category
    product-types.ts
    site-config.ts        # ENV-driven config (whatsapp, email, site URL)
    price-buckets.ts
  proxy.ts                # next-intl proxy (middleware)
messages/
  en.json                 # English translations
  es.json                 # Spanish translations
public/
  backs/                  # Hero/editorial background images
  hero/                   # Product hero photography
  logos/                  # Brand logos (Isotipo, Imagotipo, etc.)
  categories/
  icons/
  favicon/
scripts/
  list-collections.ts     # Audit utility — dump Shopify collections
  list-product-types.ts   # Audit utility — dump product types
  translate-shopify.ts    # Claude-powered auto-translation for Shopify catalog
```

---

## Getting started

### 1. Prerequisites

- Node.js 20+ (check `.nvmrc` if present)
- npm / pnpm / yarn
- Shopify store with Storefront API enabled (public access token)

### 2. Install

```bash
npm install
```

### 3. Environment variables

Copy the example file and fill it in:

```bash
cp .env.example .env.local
```

Required:
- `SHOPIFY_STORE_DOMAIN` — your `*.myshopify.com` domain
- `SHOPIFY_STOREFRONT_PUBLIC_TOKEN` — Storefront API public token
- `NEXT_PUBLIC_SITE_URL` — canonical production URL (for SEO, sitemaps, JSON-LD)
- `NEXT_PUBLIC_WHATSAPP_NUMBER` — general WhatsApp (no `+` or spaces)
- `NEXT_PUBLIC_WHATSAPP_SERVICE_NUMBER` — Coffee Worx Tech service line
- `NEXT_PUBLIC_CONTACT_EMAIL` / `NEXT_PUBLIC_COMMERCIAL_EMAIL`
- `NEXT_PUBLIC_INSTAGRAM_URL` / `NEXT_PUBLIC_LINKEDIN_URL`

Optional:
- `ANTHROPIC_API_KEY` — only needed if you run `npm run translate`

### 4. Run

```bash
npm run dev         # http://localhost:3000 → redirects to /es
npm run build       # production build
npm run start       # serve production build
npm run lint        # eslint
```

---

## i18n

- **Routing:** every route is prefixed with `/es` (default) or `/en`. Handled by `src/proxy.ts` (next-intl middleware).
- **Default locale:** `es` (Mexican market).
- **Shopify `@inContext`:** each locale maps to a `{ country, language, currency }` tuple in [`src/i18n/config.ts`](./src/i18n/config.ts). Today currency is derived from locale (ES→MXN, EN→USD); decoupling country/language/currency is tracked for a future iteration.
- **Translation files:** [`messages/es.json`](./messages/es.json) and [`messages/en.json`](./messages/en.json).
- **Content modules** (legal docs, FAQ) live under `src/content/` as typed objects rather than translation keys to avoid bloating the JSON files.

---

## Commerce layer

All Shopify access flows through [`src/lib/commerce/shopify/`](./src/lib/commerce/shopify/). Never query Shopify directly from components.

Key entry points:
- `commerce.getProducts(...)`
- `commerce.getCollection(handle, ...)`
- `commerce.getProduct(handle, ...)`
- `commerce.getBlog(handle, ...)` / `commerce.getArticle(...)`
- `commerce.createCart()` / cart context in [`src/components/cart/`](./src/components/cart/)

All queries accept `{ country, language }` from `localeCountryMap[locale]` so Shopify returns locale-specific prices and translations.

---

## Key conventions

- **Editorial-first design** — follow the new creative direction in `FOLKA_BRAND_IDENTITY.md`, not the current Shopify theme.
- **Design tokens only** — never use arbitrary hex values; use the Folka palette (Midnight Blue, Desert White, Mineral Sand) exposed as Tailwind tokens and CSS variables.
- **`next/image` always** — no raw `<img>` tags. WebP/AVIF preferred.
- **Accessibility** — WCAG AA minimum, semantic HTML, keyboard nav.
- **SEO** — every route defines `generateMetadata` with canonical + hreflang alternates, and renders the appropriate JSON-LD (see `src/lib/seo/schemas.ts`).
- **No `any` in TypeScript.** `strict: true`.
- **SOLID + clean code** — see [`ENGINEERING_STANDARDS.md`](./ENGINEERING_STANDARDS.md) for full guidelines.

---

## Dev scripts

```bash
# Audit Shopify catalog
npx tsx scripts/list-collections.ts
npx tsx scripts/list-product-types.ts

# Translate Shopify product descriptions via Claude
npm run translate           # apply translations to Shopify
npm run translate:dry       # preview only
npm run translate:force     # re-translate already-translated items
```

---

## Deployment

Vercel is the target platform. Set all `NEXT_PUBLIC_*` and `SHOPIFY_*` variables in the Vercel project settings. The `sitemap.ts` and `robots.ts` read from `NEXT_PUBLIC_SITE_URL`, so set it to the production domain (`https://folkasolutions.com`).

---

## License

Proprietary — © Folka Coffee Solutions / Pathos Guild Company, S.A. de C.V.
