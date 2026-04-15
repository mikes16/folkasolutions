"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useOptimistic,
  useTransition,
  type ReactNode,
} from "react";
import Cookies from "js-cookie";
import type { Cart, CartLineInput } from "@/lib/commerce/types";

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

async function cartFetch(action: string, body: Record<string, unknown>): Promise<Cart> {
  const res = await fetch("/api/cart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...body }),
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

  // Load cart from cookie on mount
  useEffect(() => {
    const cartId = Cookies.get(CART_COOKIE);
    if (cartId) {
      cartFetch("get", { cartId })
        .then((c) => {
          if (c) setCart(c);
          else Cookies.remove(CART_COOKIE);
        })
        .catch(() => Cookies.remove(CART_COOKIE));
    }
  }, []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const ensureCart = useCallback(async (): Promise<string> => {
    if (cart?.id) return cart.id;
    const newCart = await cartFetch("create", {});
    setCart(newCart);
    Cookies.set(CART_COOKIE, newCart.id, { expires: 30 });
    return newCart.id;
  }, [cart?.id]);

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
          const updated = await cartFetch("add", { cartId, lines: [line] });
          const newLine = updated.lines.find((l) => l.merchandise.id === line.merchandiseId);
          const expectedQty = prevQty + line.quantity;
          if (newLine && newLine.quantity < expectedQty) {
            setErrorMessage(OUT_OF_STOCK_MSG);
          }
          setCart(updated);
          Cookies.set(CART_COOKIE, updated.id, { expires: 30 });
          setIsOpen(true);
        } catch (error) {
          handleError(error, "[Cart] Failed to add item:");
          if (error instanceof CartUserError) setIsOpen(true);
        }
      });
    },
    [ensureCart, handleError, cart?.lines]
  );

  const updateItem = useCallback(
    async (lineId: string, quantity: number) => {
      if (!cart?.id) return;
      startTransition(async () => {
        try {
          setErrorMessage(null);
          if (quantity === 0) {
            const updated = await cartFetch("remove", {
              cartId: cart.id,
              lineIds: [lineId],
            });
            setCart(updated);
          } else {
            const updated = await cartFetch("update", {
              cartId: cart.id,
              lines: [{ id: lineId, quantity }],
            });
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
    [cart?.id, handleError]
  );

  const removeItem = useCallback(
    async (lineId: string) => {
      if (!cart?.id) return;
      startTransition(async () => {
        try {
          setErrorMessage(null);
          const updated = await cartFetch("remove", {
            cartId: cart.id,
            lineIds: [lineId],
          });
          setCart(updated);
        } catch (error) {
          handleError(error, "[Cart] Failed to remove item:");
        }
      });
    },
    [cart?.id, handleError]
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
