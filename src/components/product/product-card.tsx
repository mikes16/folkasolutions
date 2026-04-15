"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Product } from "@/lib/commerce/types";
import { formatMoney } from "@/lib/utils/format";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const t = useTranslations("common");
  const variant = product.variants[0];
  const isOnSale =
    variant?.compareAtPrice &&
    parseFloat(variant.compareAtPrice.amount) > parseFloat(variant.price.amount);

  return (
    <Link href={`/products/${product.handle}`} className="group flex flex-col">
      {/* Image */}
      <div className="relative aspect-square bg-card rounded-[24px] overflow-hidden mb-4 hover:shadow-md transition-shadow duration-300">
        {product.featuredImage ? (
          <Image
            src={product.featuredImage.url}
            alt={product.featuredImage.altText || product.title}
            fill
            className="object-contain p-8 group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted text-sm">
            {t("noImage")}
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-1.5">
          {!product.availableForSale && <Badge variant="sold-out">{t("soldOut")}</Badge>}
          {isOnSale && <Badge variant="sale">{t("sale")}</Badge>}
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1">
        <p className="text-[10px] uppercase tracking-[2px] text-secondary font-[family-name:var(--font-rajdhani)]">
          {product.vendor}
        </p>
        <h3 className="text-sm font-medium leading-snug group-hover:underline">
          {product.title}
        </h3>
        <div className="flex items-baseline gap-2 mt-1">
          {variant && (
            <>
              <span className="text-sm font-bold">
                {formatMoney(variant.price)}
              </span>
              {isOnSale && variant.compareAtPrice && (
                <span className="text-xs text-muted line-through">
                  {formatMoney(variant.compareAtPrice)}
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
