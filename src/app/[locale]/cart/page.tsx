"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/components/cart/cart-context";
import { formatMoney } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { EmptyState } from "@/components/ui/empty-state";

export default function CartPage() {
  const t = useTranslations();
  const { cart, isLoading, updateItem, removeItem } = useCart();

  const lines = cart?.lines ?? [];
  const isEmpty = lines.length === 0;

  return (
    <div className="container-page py-12">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-10">
            {t("cart.title")}
          </h1>

          {isEmpty ? (
            <EmptyState
              eyebrow={t("emptyState.cartEyebrow")}
              title={t("emptyState.cartTitle")}
              description={t("emptyState.cartDescription")}
              ctaHref="/shop"
              ctaText={t("emptyState.browseCatalog")}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Line items */}
              <div className="lg:col-span-2 space-y-6">
                {lines.map((line) => (
                  <div
                    key={line.id}
                    className="flex gap-5 pb-6 border-b border-border"
                  >
                    <Link
                      href={`/products/${line.merchandise.product.handle}`}
                      className="relative w-24 h-24 shrink-0 bg-white rounded-xl overflow-hidden"
                    >
                      {line.merchandise.product.featuredImage ? (
                        <Image
                          src={line.merchandise.product.featuredImage.url}
                          alt={line.merchandise.product.title}
                          fill
                          className="object-contain p-2"
                          sizes="96px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted text-xs">
                          {t("common.noImage")}
                        </div>
                      )}
                    </Link>

                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <Link
                          href={`/products/${line.merchandise.product.handle}`}
                          className="font-medium hover:underline"
                        >
                          {line.merchandise.product.title}
                        </Link>
                        {line.merchandise.title !== "Default Title" && (
                          <p className="text-sm text-muted mt-0.5">
                            {line.merchandise.title}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-border rounded-full">
                          <button
                            onClick={() =>
                              line.quantity === 1
                                ? removeItem(line.id)
                                : updateItem(line.id, line.quantity - 1)
                            }
                            disabled={isLoading}
                            className="w-9 h-9 flex items-center justify-center text-sm hover:bg-foreground/5 rounded-l-full disabled:opacity-40"
                          >
                            -
                          </button>
                          <span className="w-10 text-center text-sm tabular-nums">
                            {line.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateItem(line.id, line.quantity + 1)
                            }
                            disabled={isLoading}
                            className="w-9 h-9 flex items-center justify-center text-sm hover:bg-foreground/5 rounded-r-full disabled:opacity-40"
                          >
                            +
                          </button>
                        </div>

                        <span className="font-bold">
                          {formatMoney(line.cost.totalAmount)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => removeItem(line.id)}
                      disabled={isLoading}
                      className="self-start p-1 text-muted hover:text-foreground transition-colors disabled:opacity-40"
                    >
                      <Icon name="close" size={18} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Summary */}
              {cart && (
                <div className="bg-white rounded-[24px] p-8 h-fit space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-muted">{t("common.subtotal")}</span>
                    <span className="text-xl font-bold">
                      {formatMoney(cart.cost.subtotalAmount)}
                    </span>
                  </div>

                  <p className="text-xs text-muted">{t("common.taxesShipping")}</p>

                  <a href={cart.checkoutUrl} className="block">
                    <Button size="lg" className="w-full">
                      {t("common.checkout")}
                    </Button>
                  </a>

                  {/* Trust badges */}
                  <div className="pt-4 border-t border-border space-y-2">
                    <p className="text-xs text-muted text-center">
                      {t("cart.trustBadges")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
    </div>
  );
}
