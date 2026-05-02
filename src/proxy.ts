import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: [
    "/",
    "/(es|en)/:path*",
    // Exclude paths Shopify owns on the primary domain. Customer auth lives
    // on account.folkasolutions.com (see header link). Email click trackers
    // (`_t`) and cart-recovery URLs (`cart/c/...`) get forwarded to the
    // .myshopify.com host via redirects in next.config.ts so abandoned cart
    // emails actually restore the cart.
    "/((?!api|ingest|_next|_vercel|customer_authentication|customer_identity|services/customer_account|_t|cart/c|.*\\..*).*)",
  ],
};
