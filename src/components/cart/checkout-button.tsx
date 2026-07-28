"use client";

import { useTranslations } from "next-intl";
import posthog from "posthog-js";
import type { Cart } from "@/lib/commerce/types";
import { Button } from "@/components/ui/button";
import { useCart } from "./cart-context";

/**
 * Hand-off to Shopify's checkout, shared by the cart drawer and the cart page.
 *
 * Owns the two things that must happen before the browser leaves the site:
 * the `begin_checkout` capture (previously only fired from the drawer, so
 * /cart checkouts were invisible in the funnel) and refreshing the PostHog
 * identifiers stamped on the cart. Navigation is never blocked by either:
 * any failure still falls through to the checkout URL.
 */
export function CheckoutButton({ cart }: { cart: Cart }) {
  const t = useTranslations();
  const { prepareCheckout } = useCart();

  const handleClick = async (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    try {
      posthog.startSessionRecording();
    } catch {
      // ignore — SDK may not expose method on older builds
    }

    try {
      posthog.capture("begin_checkout", {
        cart_total: cart.cost.totalAmount?.amount,
        cart_total_currency: cart.cost.totalAmount?.currencyCode,
        subtotal: cart.cost.subtotalAmount?.amount,
        item_count: cart.totalQuantity,
        items: cart.lines.map((l) => ({
          product_title: l.merchandise.product.title,
          variant_title: l.merchandise.title,
          quantity: l.quantity,
          price: l.merchandise.price?.amount,
        })),
      });
      await prepareCheckout();
    } catch {
      // ignore — analytics must never stand between a buyer and checkout
    }

    window.location.assign(cart.checkoutUrl);
  };

  return (
    <a href={cart.checkoutUrl} className="block" onClick={handleClick}>
      <Button size="lg" className="w-full">
        {t("common.checkout")}
      </Button>
    </a>
  );
}
