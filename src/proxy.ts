import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: [
    "/",
    "/(es|en)/:path*",
    // Exclude paths Shopify still owns on the primary domain. Email click
    // trackers (`_t`) and cart-recovery URLs (`cart/c/...`) get forwarded to
    // the .myshopify.com host via redirects in next.config.ts so abandoned
    // cart emails actually restore the cart.
    "/((?!api|ingest|_next|_vercel|_t|cart/c|.*\\..*).*)",
  ],
};
