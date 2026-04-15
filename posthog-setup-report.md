<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the Folka Coffee Next.js App Router project. Client-side tracking is initialized via `instrumentation-client.ts` (the recommended approach for Next.js 15.3+), with a reverse proxy configured in `next.config.ts` so all PostHog requests route through `/ingest` to avoid ad blockers. A server-side PostHog client (`src/lib/posthog-server.ts`) handles the cart API route. The client passes its PostHog distinct ID and session ID to the server via request headers (`X-POSTHOG-DISTINCT-ID`, `X-POSTHOG-SESSION-ID`) so client and server events are correlated to the same user. Error tracking via `posthog.captureException` was added to cart and search error paths.

| Event | Description | File |
|---|---|---|
| `product_viewed` | User views a product detail page — top of conversion funnel | `src/components/product/product-viewed-tracker.tsx` |
| `product_clicked` | User clicks a product card in a listing or grid | `src/components/product/product-card.tsx` |
| `variant_selected` | User selects a product variant option (e.g. color, size) | `src/components/product/product-info.tsx` |
| `whatsapp_inquiry_clicked` | User clicks the WhatsApp inquiry button on a product page | `src/components/product/product-info.tsx` |
| `add_to_cart` | User adds a product variant to the cart | `src/components/cart/cart-context.tsx` |
| `remove_from_cart` | User removes an item from the cart | `src/components/cart/cart-context.tsx` |
| `cart_item_added_server` | Server-side: item successfully added to Shopify cart | `src/app/api/cart/route.ts` |
| `begin_checkout` | User clicks the checkout button in the cart drawer | `src/components/cart/cart-drawer.tsx` |
| `search_performed` | User submits a search query, including result count | `src/app/[locale]/search/page.tsx` |
| `newsletter_subscribed` | User submits the newsletter signup form | `src/components/sections/newsletter.tsx` |
| `hero_cta_clicked` | User clicks a CTA link on the hero carousel slide | `src/components/sections/hero-carousel.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard — Analytics basics:** https://us.posthog.com/project/382822/dashboard/1469689
- **Purchase Funnel: View → Cart → Checkout** (full conversion funnel): https://us.posthog.com/project/382822/insights/CLuO7ep0
- **Product Views & Add to Cart — Daily Trend** (discovery vs. intent over time): https://us.posthog.com/project/382822/insights/NoIcwAHW
- **Search Performance — Queries with No Results** (identify catalog gaps): https://us.posthog.com/project/382822/insights/H6zEHhjY
- **WhatsApp Inquiry vs. Add to Cart** (consultative vs. self-serve buying): https://us.posthog.com/project/382822/insights/DnbmFSvI
- **Newsletter Subscriptions — Daily** (audience growth over time): https://us.posthog.com/project/382822/insights/B02osoJB

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
