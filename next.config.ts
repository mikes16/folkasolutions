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
      // Shopify mints customer-auth URLs on the primary domain. Now that
      // primary_domain (folkasolutions.com) lives on Vercel, those paths
      // 404 here. Bounce them to the .myshopify.com host so Shopify can
      // run its SSO flow and end at account.folkasolutions.com.
      {
        source: "/customer_authentication/:path*",
        destination:
          "https://cafe-folka.myshopify.com/customer_authentication/:path*",
        permanent: false,
      },
      {
        source: "/customer_identity/:path*",
        destination:
          "https://cafe-folka.myshopify.com/customer_identity/:path*",
        permanent: false,
      },
      {
        source: "/services/customer_account/:path*",
        destination:
          "https://cafe-folka.myshopify.com/services/customer_account/:path*",
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
