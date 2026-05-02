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
