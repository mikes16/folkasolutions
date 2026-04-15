"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { Product } from "@/lib/commerce/types";
import { formatMoney } from "@/lib/utils/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/cart-context";
import { Icon } from "@/components/ui/icon";
import { getSwatchColor, isColorOption } from "@/lib/color-swatches";
import { cn } from "@/lib/utils/cn";
import { siteConfig, whatsappLink } from "@/lib/site-config";

const COLLAPSED_HEIGHT = 160;

interface ProductInfoProps {
  product: Product;
  selectedVariantIndex?: number;
  onVariantChange?: (index: number) => void;
}

export function ProductInfo({ product, selectedVariantIndex: externalIndex, onVariantChange }: ProductInfoProps) {
  const [internalIndex, setInternalIndex] = useState(0);
  const selectedVariantIndex = externalIndex ?? internalIndex;
  const setSelectedVariantIndex = onVariantChange ?? setInternalIndex;
  const t = useTranslations("common");
  const tp = useTranslations("product");
  const { addItem, isLoading } = useCart();
  const variant = product.variants[selectedVariantIndex];

  const isOnSale = variant?.compareAtPrice && parseFloat(variant.compareAtPrice.amount) > parseFloat(variant.price.amount);

  const ctaRef = useRef<HTMLButtonElement>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const addingRef = useRef(false);

  useEffect(() => {
    if (!isLoading && addingRef.current) {
      addingRef.current = false;
      setJustAdded(true);
      const timer = setTimeout(() => setJustAdded(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
    <div className="flex flex-col gap-4 md:gap-6">
      {/* Vendor */}
      <p className="text-[11px] uppercase tracking-[2.5px] font-medium text-muted">
        {product.vendor}
      </p>

      {/* Title + badges */}
      <div className="flex flex-wrap items-start gap-3">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">
          {product.title}
        </h1>
        {!product.availableForSale && <Badge variant="sold-out">{t("soldOut")}</Badge>}
        {isOnSale && <Badge variant="sale">{t("sale")}</Badge>}
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-3">
        {variant && (
          <>
            <span className="text-2xl font-bold">
              {formatMoney(variant.price)}
            </span>
            {isOnSale && variant.compareAtPrice && (
              <span className="text-lg text-muted line-through">
                {formatMoney(variant.compareAtPrice)}
              </span>
            )}
          </>
        )}
      </div>

      {/* Options */}
      {product.options
        .filter((opt) => opt.values.length > 1)
        .map((option) => {
          const isColor = isColorOption(option.name);
          const selectedValue = variant?.selectedOptions.find(
            (so) => so.name === option.name
          )?.value;

          return (
            <div key={option.id} className="flex flex-col gap-3">
              <label className="text-sm font-medium">
                {option.name}
                {isColor && selectedValue && (
                  <span className="text-muted font-normal ml-2">— {selectedValue}</span>
                )}
              </label>
              <div className="flex flex-wrap gap-2">
                {option.values.map((value) => {
                  const isSelected = value === selectedValue;
                  const swatch = isColor ? getSwatchColor(value) : null;

                  return (
                    <button
                      key={value}
                      aria-pressed={isSelected}
                      aria-label={value}
                      title={value}
                      onClick={() => {
                        const idx = product.variants.findIndex((v) =>
                          v.selectedOptions.every((so) =>
                            so.name === option.name
                              ? so.value === value
                              : variant?.selectedOptions.find((s) => s.name === so.name)?.value === so.value
                          )
                        );
                        if (idx !== -1) setSelectedVariantIndex(idx);
                      }}
                      className={
                        swatch
                          ? `relative w-10 h-10 rounded-full border-2 transition-all ${
                              isSelected
                                ? "border-foreground scale-110 ring-2 ring-foreground ring-offset-2 ring-offset-background"
                                : "border-border/50 hover:border-foreground/50 hover:scale-105"
                            }`
                          : `px-4 py-2 text-sm rounded-full border transition-colors ${
                              isSelected
                                ? "border-foreground bg-foreground text-primary-foreground"
                                : "border-border hover:border-foreground"
                            }`
                      }
                    >
                      {swatch ? (
                        <span
                          className="absolute inset-[3px] rounded-full"
                          style={{
                            background: swatch,
                            boxShadow: swatch === "#ffffff" ? "inset 0 0 0 1px rgba(0,0,0,0.1)" : undefined,
                          }}
                        />
                      ) : (
                        value
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

      {/* Add to cart */}
      <Button
        ref={ctaRef}
        size="lg"
        className="w-full mt-2"
        disabled={!product.availableForSale || !variant || isLoading}
        onClick={() => {
          if (variant) {
            addingRef.current = true;
            setJustAdded(false);
            addItem({ merchandiseId: variant.id, quantity: 1 });
          }
        }}
      >
        {!product.availableForSale
          ? t("soldOut")
          : isLoading
            ? t("adding")
            : justAdded
              ? t("addedToCart")
              : t("addToCart")}
      </Button>

      {/* WhatsApp */}
      <a
        href={whatsappLink(
          siteConfig.whatsapp.general,
          `Hola, tengo una pregunta sobre: ${product.title}${variant ? ` (${variant.title})` : ""}\n${siteConfig.siteUrl}/products/${product.handle}`
        )}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 w-full md:w-auto px-5 py-3 md:py-0 md:px-0 rounded-full md:rounded-none border border-border md:border-0 text-sm text-muted hover:text-foreground hover:border-foreground/30 md:hover:border-0 transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-[#25D366] shrink-0"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        {tp("buyWhatsApp")}
      </a>

      {/* Trust badges */}
      <TrustBadges />

      {/* Description */}
      {product.descriptionHtml && (
        <ExpandableDescription html={product.descriptionHtml} />
      )}
    </div>

    {/* Sticky bottom bar — mobile */}
    <div
      className={cn(
        "fixed bottom-0 inset-x-0 z-40 md:hidden bg-background/95 backdrop-blur-md border-t border-border px-5 transition-transform duration-300",
        showStickyBar ? "translate-y-0" : "translate-y-full"
      )}
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <div className="flex items-center gap-3 py-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted truncate">{product.title}</p>
          <p className="text-base font-bold">{variant ? formatMoney(variant.price) : ""}</p>
        </div>
        <Button
          disabled={!product.availableForSale || !variant || isLoading}
          onClick={() => {
            if (variant) {
              addingRef.current = true;
              setJustAdded(false);
              addItem({ merchandiseId: variant.id, quantity: 1 });
            }
          }}
        >
          {!product.availableForSale ? t("soldOut") : isLoading ? t("adding") : justAdded ? t("addedToCart") : t("addToCart")}
        </Button>
      </div>
    </div>
    </>
  );
}

function TrustBadges() {
  const t = useTranslations("product.trust");
  const badges = [
    { icon: "shield-check" as const, title: t("officialImporter"), sub: t("officialImporterSub") },
    { icon: "truck" as const, title: t("insuredShipping"), sub: t("insuredShippingSub") },
    { icon: "chat-bubble" as const, title: t("expertAdvice"), sub: t("expertAdviceSub") },
  ];

  return (
    <ul className="grid grid-cols-3 gap-3 mt-2 border-t border-border/60 pt-5">
      {badges.map((badge) => (
        <li key={badge.icon} className="flex flex-col items-center text-center gap-2">
          <Icon name={badge.icon} size={22} className="text-foreground/70" aria-hidden="true" />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] leading-tight">
              {badge.title}
            </p>
            <p className="text-[11px] text-muted mt-0.5 leading-snug">{badge.sub}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function ExpandableDescription({ html }: { html: string }) {
  const t = useTranslations("product");
  const contentRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"measuring" | "short" | "collapsible">("measuring");
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!contentRef.current) return;
    const check = () => {
      if (!contentRef.current) return;
      setState(contentRef.current.scrollHeight > COLLAPSED_HEIGHT + 40 ? "collapsible" : "short");
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const showCollapsed = state === "collapsible" && !expanded;

  return (
    <div className="mt-2">
      <div className="relative">
        <div
          ref={contentRef}
          className="pdp-description overflow-hidden"
          style={{
            maxHeight: state === "short" ? "none" : (expanded ? contentRef.current?.scrollHeight ?? 9999 : COLLAPSED_HEIGHT),
            transition: state === "measuring" ? "none" : "max-height 500ms ease-in-out",
          }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
        {showCollapsed && (
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none" />
        )}
      </div>

      {state === "collapsible" && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-4 inline-flex items-center gap-2 px-5 py-3 bg-white text-foreground border border-border shadow-sm rounded-full text-[11px] uppercase tracking-[2px] hover:shadow-md hover:border-foreground/30 transition-all"
        >
          <span>{expanded ? t("showLess") : t("showMore")}</span>
          <Icon
            name="chevron-down"
            size={14}
            className={`transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </button>
      )}
    </div>
  );
}


