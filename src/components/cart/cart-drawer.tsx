"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart } from "./cart-context";
import { formatMoney } from "@/lib/utils/format";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import posthog from "posthog-js";

export function CartDrawer() {
  const t = useTranslations();
  const { cart, isOpen, isLoading, errorMessage, clearError, closeCart, updateItem, removeItem } =
    useCart();

  if (!isOpen) return null;

  const lines = cart?.lines ?? [];
  const isEmpty = lines.length === 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-50 transition-opacity"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("a11y.closeCart")}
        className="fixed top-0 right-0 h-full w-full max-w-md bg-background z-50 shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <h2 className="text-lg font-bold tracking-tight">
            {t("cart.title")}{" "}
            {cart && cart.totalQuantity > 0 && (
              <span className="text-muted font-normal">
                ({cart.totalQuantity})
              </span>
            )}
          </h2>
          <button
            onClick={closeCart}
            aria-label={t("a11y.closeCart")}
            className="p-1 hover:opacity-60 transition-opacity"
          >
            <Icon name="close" size={24} />
          </button>
        </div>

        {/* Error banner */}
        {errorMessage && (
          <div className="mx-6 mt-4 flex items-start gap-3 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
            <Icon name="close" size={16} className="mt-0.5 shrink-0 rounded-full bg-red-500 text-white p-0.5" />
            <p className="flex-1">{errorMessage}</p>
            <button
              onClick={clearError}
              aria-label="Dismiss"
              className="shrink-0 text-red-700/70 hover:text-red-700"
            >
              <Icon name="close" size={14} />
            </button>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <p className="text-muted">{t("cart.empty")}</p>
              <Button variant="outline" size="sm" onClick={closeCart}>
                {t("common.continueShopping")}
              </Button>
            </div>
          ) : (
            <ul className="flex flex-col gap-5">
              {lines.map((line) => {
                // Prefer variant-specific image; fall back to product featured image.
                const lineImage =
                  line.merchandise.image ?? line.merchandise.product.featuredImage;
                return (
                <li key={line.id} className="flex gap-4">
                  {/* Image */}
                  <Link
                    href={`/products/${line.merchandise.product.handle}`}
                    onClick={closeCart}
                    className="relative w-20 h-20 shrink-0 bg-white rounded-xl overflow-hidden"
                  >
                    {lineImage ? (
                      <Image
                        src={lineImage.url}
                        alt={lineImage.altText || line.merchandise.product.title}
                        fill
                        className="object-contain p-2"
                        sizes="80px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted text-xs">
                        {t("common.noImage")}
                      </div>
                    )}
                  </Link>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <Link
                        href={`/products/${line.merchandise.product.handle}`}
                        onClick={closeCart}
                        className="text-sm font-medium leading-snug hover:underline line-clamp-2"
                      >
                        {line.merchandise.product.title}
                      </Link>
                      {line.merchandise.title !== "Default Title" && (
                        <p className="text-xs text-muted mt-0.5">
                          {line.merchandise.title}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity controls */}
                      <div className="flex items-center border border-border rounded-full">
                        <button
                          onClick={() =>
                            line.quantity === 1
                              ? removeItem(line.id)
                              : updateItem(line.id, line.quantity - 1)
                          }
                          disabled={isLoading}
                          aria-label={t("a11y.decreaseQuantity")}
                          className="w-8 h-8 flex items-center justify-center text-sm hover:bg-foreground/5 rounded-l-full disabled:opacity-40"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-sm tabular-nums">
                          {line.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateItem(line.id, line.quantity + 1)
                          }
                          disabled={isLoading}
                          aria-label={t("a11y.increaseQuantity")}
                          className="w-8 h-8 flex items-center justify-center text-sm hover:bg-foreground/5 rounded-r-full disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>

                      {/* Price */}
                      <span className="text-sm font-bold">
                        {formatMoney(line.cost.totalAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeItem(line.id)}
                    disabled={isLoading}
                    aria-label={t("a11y.removeItem", { item: line.merchandise.product.title })}
                    className="self-start p-1 text-muted hover:text-foreground transition-colors disabled:opacity-40"
                  >
                    <Icon name="close" size={16} />
                  </button>
                </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        {!isEmpty && cart && (
          <div className="border-t border-border px-6 py-5 space-y-4">
            {/* Subtotal */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">{t("common.subtotal")}</span>
              <span className="text-lg font-bold">
                {formatMoney(cart.cost.subtotalAmount)}
              </span>
            </div>
            <p className="text-xs text-muted">
              {t("common.taxesShipping")}
            </p>

            {/* Checkout button */}
            <a
              href={cart.checkoutUrl}
              className="block"
              onClick={() => {
                try {
                  posthog.startSessionRecording();
                } catch {
                  // ignore — SDK may not expose method on older builds
                }
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
              }}
            >
              <Button size="lg" className="w-full">
                {t("common.checkout")}
              </Button>
            </a>
          </div>
        )}
      </div>
    </>
  );
}
