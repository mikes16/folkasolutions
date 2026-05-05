import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import createMDX from "@next/mdx";
import { remarkPlugins, rehypePlugins } from "./src/lib/content/mdx-config";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const withMDX = createMDX({
  options: {
    // Plugins are passed by string name for Turbopack compatibility (see
    // mdx-config.ts). We deep-clone the readonly tuples into mutable arrays
    // so the loader can hold them without TS variance complaints.
    remarkPlugins: remarkPlugins.map((entry) =>
      typeof entry === "string" ? entry : [entry[0], entry[1]],
    ),
    rehypePlugins: rehypePlugins.map((entry) =>
      typeof entry === "string" ? entry : [entry[0], entry[1]],
    ),
  },
});

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
      // Shop Pay's "Login with Shop" OAuth handshake. Shopify hardcodes
      // the OAuth `redirect_uri` to the configured primary domain
      // (folkasolutions.com) regardless of which host received the
      // initial authorize request. A 30x redirect to cafe-folka.myshopify
      // would change the URL bar and cause the OAuth host validation to
      // fail. Proxy server-side instead so the URL stays on the apex,
      // session cookies stick to folkasolutions.com, and redirect_uri
      // matches what shop.app expects on callback.
      {
        source: "/:locale(es|en)/services/login_with_shop/:rest*",
        destination:
          "https://cafe-folka.myshopify.com/services/login_with_shop/:rest*",
      },
      {
        source: "/services/login_with_shop/:rest*",
        destination:
          "https://cafe-folka.myshopify.com/services/login_with_shop/:rest*",
      },
    ];
  },
  async redirects() {
    return [
      // Strip Shopify Markets locale segment (e.g. /es/en-us/, /en/es-mx/)
      // from URLs people may have bookmarked from the legacy Shopify
      // storefront. The apex `/:locale/:rest*` already handles language;
      // the second segment was Shopify's market code and is no longer used.
      {
        source: "/:locale(es|en)/:market([a-z]{2}-[a-z]{2})/:rest*",
        destination: "/:locale/:rest*",
        permanent: true,
      },
      // Shopify Markets as a single-segment prefix (e.g. /en-us/products/...,
      // /es-mx/collections/...). Map the language portion to our i18n locale
      // and drop the country, so old Google index entries and external links
      // land on the correct localized page instead of the [locale] catch-all.
      {
        source: "/:market(en-[a-z]{2})/:rest*",
        destination: "/en/:rest*",
        permanent: true,
      },
      {
        source: "/:market(es-[a-z]{2})/:rest*",
        destination: "/es/:rest*",
        permanent: true,
      },
      // Shopify oEmbed metadata endpoints (used by Slack/Discord/embed.ly to
      // render link previews). We don't serve oEmbed JSON, but redirecting
      // to the canonical page lets external embedders fall back to the
      // OpenGraph tags on the product/collection HTML.
      {
        source: "/products/:handle.oembed",
        destination: "/products/:handle",
        permanent: true,
      },
      {
        source: "/:locale(es|en)/products/:handle.oembed",
        destination: "/:locale/products/:handle",
        permanent: true,
      },
      {
        source: "/collections/:handle.oembed",
        destination: "/collections/:handle",
        permanent: true,
      },
      {
        source: "/:locale(es|en)/collections/:handle.oembed",
        destination: "/:locale/collections/:handle",
        permanent: true,
      },
      // Shopify email click trackers and cart-recovery URLs get minted on
      // the primary domain (folkasolutions.com), but the apex now lives on
      // Vercel. Forward them to the .myshopify.com host so abandoned cart
      // emails and Shopify Email links actually work.
      {
        source: "/_t/:path*",
        destination: "https://cafe-folka.myshopify.com/_t/:path*",
        permanent: false,
      },
      {
        source: "/cart/c/:path*",
        destination: "https://cafe-folka.myshopify.com/cart/c/:path*",
        permanent: false,
      },
      // Shopify checkout recovery URLs use the form
      // /<shop-id>/checkouts/ac/<token>/recover (with optional locale
      // prefix that Shopify Email injects). Forward the whole pattern to
      // cafe-folka.myshopify.com so click-throughs from abandoned cart
      // emails actually restore checkout.
      {
        source: "/:locale(es|en)/:shopId(\\d+)/checkouts/:rest*",
        destination:
          "https://cafe-folka.myshopify.com/:shopId/checkouts/:rest*",
        permanent: false,
      },
      {
        source: "/:shopId(\\d+)/checkouts/:rest*",
        destination:
          "https://cafe-folka.myshopify.com/:shopId/checkouts/:rest*",
        permanent: false,
      },
    ];
  },
  // Required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
  images: {
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

// Note: `pageExtensions` intentionally NOT extended with `.mdx`. Editorial
// content is dynamic-imported from a content directory at runtime, not routed
// via the filesystem.
export default withMDX(withNextIntl(nextConfig));
