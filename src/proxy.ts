import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: [
    "/",
    "/(es|en)/:path*",
    // Exclude paths Shopify hits during customer auth / new-customer-account
    // SSO flow. They land on the apex because primary_domain points here, but
    // need to be redirected to the .myshopify.com host (see next.config.ts) so
    // Shopify can complete the flow and bounce to account.folkasolutions.com.
    "/((?!api|ingest|_next|_vercel|customer_authentication|services/customer_account|.*\\..*).*)",
  ],
};
