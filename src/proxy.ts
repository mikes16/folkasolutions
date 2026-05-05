import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: [
    "/",
    "/(es|en)/:path*",
    // Exclude paths Shopify still owns on the primary domain. Email click
    // trackers (`_t`), cart-recovery URLs (`cart/c/...`), and the Shop Pay
    // "Login with Shop" handshake (`services/login_with_shop/...`) get
    // forwarded to the .myshopify.com host via redirects in next.config.ts
    // so abandoned cart emails restore the cart and Shop Pay login works.
    "/((?!api|ingest|_next|_vercel|_t|cart/c|services/login_with_shop|.*\\..*).*)",
  ],
};
