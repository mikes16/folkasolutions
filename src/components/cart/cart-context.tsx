"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useOptimistic,
  useTransition,
  type ReactNode,
} from "react";
import Cookies from "js-cookie";
import posthog from "posthog-js";
import { useLocale } from "next-intl";
import type { Cart, CartLineInput } from "@/lib/commerce/types";
import { localeCountryMap, type Locale } from "@/i18n/config";

const CART_COOKIE = "folka_cart_id";
const OUT_OF_STOCK_MSG = "No hay más unidades disponibles en stock.";

interface CartContextType {
  cart: Cart | null;
  isOpen: boolean;
  isLoading: boolean;
  errorMessage: string | null;
  clearError: () => void;
  openCart: () => void;
  closeCart: () => void;
  addItem: (line: CartLineInput) => Promise<void>;
  updateItem: (lineId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

// Server actions via API routes to avoid exposing tokens client-side
class CartUserError extends Error {}

async function cartFetch(
  action: string,
  body: Record<string, unknown>,
  locale: { country: string; language: string }
): Promise<Cart> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  try {
    const posthog = (await import("posthog-js")).default;
    const distinctId = posthog.get_distinct_id?.();
    const sessionId = posthog.get_session_id?.();
    if (distinctId) headers["X-POSTHOG-DISTINCT-ID"] = distinctId;
    if (sessionId) headers["X-POSTHOG-SESSION-ID"] = sessionId;
  } catch {
    // PostHog not initialized yet — skip headers
  }
  const res = await fetch("/api/cart", {
    method: "POST",
    headers,
    body: JSON.stringify({ action, ...locale, ...body }),
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    console.error(`[Cart] ${action} failed:`, detail);
    if (detail?.code === "USER_ERROR" && typeof detail.error === "string") {
      throw new CartUserError(detail.error);
    }
    throw new Error(`Cart ${action} failed: ${JSON.stringify(detail)}`);
  }
  return res.json();
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const clearError = useCallback(() => setErrorMessage(null), []);

  // Active locale → country/language for Shopify @inContext (ensures cart
  // prices match product page, including market-level tax/price adjustments).
  const activeLocale = useLocale() as Locale;
  const locale = useMemo(() => {
    const entry = localeCountryMap[activeLocale] ?? localeCountryMap.es;
    return { country: entry.country, language: entry.language };
  }, [activeLocale]);

  // Load cart from cookie on mount
  useEffect(() => {
    const cartId = Cookies.get(CART_COOKIE);
    if (cartId) {
      cartFetch("get", { cartId }, locale)
        .then((c) => {
          if (c) setCart(c);
          else Cookies.remove(CART_COOKIE);
        })
        .catch(() => Cookies.remove(CART_COOKIE));
    }
    // Only runs once on mount — locale is stable per render tree.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync cart's buyerIdentity.countryCode with the active locale. Without
  // this, line costs are calculated against whatever country the cart was
  // created with (or the shop default), so Markets price adjustments like
  // a +8% import surcharge get dropped silently from the cart total.
  useEffect(() => {
    if (!cart) return;
    if (cart.buyerIdentity.countryCode === locale.country) return;
    cartFetch(
      "updateBuyerIdentity",
      { cartId: cart.id, countryCode: locale.country },
      locale
    )
      .then(setCart)
      .catch((err) => {
        console.error("[Cart] updateBuyerIdentity failed:", err);
      });
  }, [cart, locale]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const ensureCart = useCallback(async (): Promise<string> => {
    if (cart?.id) return cart.id;
    const newCart = await cartFetch("create", {}, locale);
    setCart(newCart);
    Cookies.set(CART_COOKIE, newCart.id, { expires: 30 });
    // Stamp the PostHog distinct_id onto the cart as a note attribute so
    // the orders/create webhook can stitch the pre-checkout journey to
    // the purchase.
    try {
      const distinctId = posthog.get_distinct_id?.();
      if (distinctId) {
        await cartFetch(
          "updateAttributes",
          {
            cartId: newCart.id,
            attributes: [{ key: "posthog_distinct_id", value: distinctId }],
          },
          locale
        );
      }
    } catch {
      // ignore — non-fatal for cart creation
    }
    return newCart.id;
  }, [cart?.id, locale]);

  const handleError = useCallback((error: unknown, fallback: string) => {
    if (error instanceof CartUserError) {
      setErrorMessage(error.message);
    } else {
      console.error(fallback, error);
      setErrorMessage(null);
    }
  }, []);

  const addItem = useCallback(
    async (line: CartLineInput) => {
      startTransition(async () => {
        try {
          setErrorMessage(null);
          const cartId = await ensureCart();
          const prevQty =
            cart?.lines.find((l) => l.merchandise.id === line.merchandiseId)?.quantity ?? 0;
          const updated = await cartFetch("add", { cartId, lines: [line] }, locale);
          const newLine = updated.lines.find((l) => l.merchandise.id === line.merchandiseId);
          const expectedQty = prevQty + line.quantity;
          if (newLine && newLine.quantity < expectedQty) {
            setErrorMessage(OUT_OF_STOCK_MSG);
          }
          const addedLine = updated.lines.find((l) => l.merchandise.id === line.merchandiseId);
          posthog.capture("add_to_cart", {
            merchandise_id: line.merchandiseId,
            quantity: line.quantity,
            product_title: addedLine?.merchandise.product.title,
            variant_title: addedLine?.merchandise.title,
            price: addedLine?.merchandise.price?.amount,
            currency: addedLine?.merchandise.price?.currencyCode,
            cart_total: updated.cost?.totalAmount?.amount,
            cart_total_currency: updated.cost?.totalAmount?.currencyCode,
          });
          // High-intent signal: start session replay now to capture journey
          // to checkout (or abandonment). Only runs on client; no-op if already on.
          try {
            posthog.startSessionRecording();
          } catch {
            // ignore — SDK may not expose method on older builds
          }
          setCart(updated);
          Cookies.set(CART_COOKIE, updated.id, { expires: 30 });
          setIsOpen(true);
        } catch (error) {
          posthog.captureException(error);
          handleError(error, "[Cart] Failed to add item:");
          if (error instanceof CartUserError) setIsOpen(true);
        }
      });
    },
    [ensureCart, handleError, cart?.lines, locale]
  );

  const updateItem = useCallback(
    async (lineId: string, quantity: number) => {
      if (!cart?.id) return;
      startTransition(async () => {
        try {
          setErrorMessage(null);
          if (quantity === 0) {
            const updated = await cartFetch(
              "remove",
              { cartId: cart.id, lineIds: [lineId] },
              locale
            );
            setCart(updated);
          } else {
            const updated = await cartFetch(
              "update",
              { cartId: cart.id, lines: [{ id: lineId, quantity }] },
              locale
            );
            const updatedLine = updated.lines.find((l) => l.id === lineId);
            if (updatedLine && updatedLine.quantity !== quantity) {
              setErrorMessage(OUT_OF_STOCK_MSG);
            }
            setCart(updated);
          }
        } catch (error) {
          handleError(error, "[Cart] Failed to update item:");
        }
      });
    },
    [cart?.id, handleError, locale]
  );

  const removeItem = useCallback(
    async (lineId: string) => {
      if (!cart?.id) return;
      const removedLine = cart.lines.find((l) => l.id === lineId);
      startTransition(async () => {
        try {
          setErrorMessage(null);
          const updated = await cartFetch(
            "remove",
            { cartId: cart.id, lineIds: [lineId] },
            locale
          );
          posthog.capture("remove_from_cart", {
            product_title: removedLine?.merchandise.product.title,
            variant_title: removedLine?.merchandise.title,
            merchandise_id: removedLine?.merchandise.id,
            quantity: removedLine?.quantity,
            price: removedLine?.merchandise.price?.amount,
            currency: removedLine?.merchandise.price?.currencyCode,
          });
          setCart(updated);
        } catch (error) {
          posthog.captureException(error);
          handleError(error, "[Cart] Failed to remove item:");
        }
      });
    },
    [cart?.id, cart?.lines, handleError, locale]
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        isOpen,
        isLoading,
        errorMessage,
        clearError,
        openCart,
        closeCart,
        addItem,
        updateItem,
        removeItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
