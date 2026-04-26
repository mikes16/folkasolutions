import Image from "next/image";
import { getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { commerce } from "@/lib/commerce";
import { localeCountryMap, type Locale } from "@/i18n/config";
import { formatMoney } from "@/lib/utils/format";

export interface ProductCalloutProps {
  handle: string;
  variant?: "default" | "horizontal";
  /** Optional one-line editorial framing displayed above the product. */
  eyebrow?: string;
}

/**
 * Inline editorial product card for MDX articles. Server component — fetches
 * the product at render time using the request's locale/country so the
 * pricing matches the page context.
 *
 * Renders nothing if the handle resolves to no product (broken handles must
 * not break the article).
 */
export async function ProductCallout({
  handle,
  variant = "default",
  eyebrow,
}: ProductCalloutProps) {
  const localeRaw = await getLocale();
  const locale = (localeRaw as Locale) in localeCountryMap
    ? (localeRaw as Locale)
    : "es";
  const { country, language } = localeCountryMap[locale];

  const product = await commerce.getProduct(handle, { country, language });
  if (!product) return null;

  const productVariant = product.variants[0];
  const priceLabel = productVariant ? formatMoney(productVariant.price) : null;
  const ctaLabel = locale === "es" ? "Comprar" : "Shop";

  if (variant === "horizontal") {
    return (
      <Link
        href={`/products/${product.handle}`}
        className="group block my-10 border border-foreground/15 p-6 md:p-8 transition-colors duration-300 hover:border-foreground/30"
      >
        <div className="flex flex-row items-center gap-6 md:gap-8">
          <div className="relative aspect-square w-2/5 max-w-[200px] shrink-0 overflow-hidden bg-card/60">
            {product.featuredImage && (
              <Image
                src={product.featuredImage.url}
                alt={product.featuredImage.altText || product.title}
                fill
                sizes="(max-width: 768px) 40vw, 200px"
                className="object-contain p-4 transition-transform duration-700 ease-out group-hover:scale-105"
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            {eyebrow && (
              <p className="text-[10px] uppercase tracking-[3px] text-foreground/55 font-[family-name:var(--font-rajdhani)] font-medium mb-3">
                {eyebrow}
              </p>
            )}
            <p className="text-[10px] uppercase tracking-[2px] text-foreground/55 font-[family-name:var(--font-rajdhani)]">
              {product.vendor}
            </p>
            <h3 className="text-lg md:text-xl font-medium leading-snug mt-1 mb-2 transition-colors duration-300 group-hover:text-foreground/70">
              {product.title}
            </h3>
            {priceLabel && (
              <p className="text-base font-semibold mb-3">{priceLabel}</p>
            )}
            <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[3px] font-[family-name:var(--font-rajdhani)] font-medium text-foreground/80 transition-colors duration-300 group-hover:text-foreground">
              {ctaLabel}
              <span aria-hidden="true">&rarr;</span>
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/products/${product.handle}`}
      className="group block my-10 border border-foreground/15 p-6 md:p-8 transition-colors duration-300 hover:border-foreground/30"
    >
      {eyebrow && (
        <p className="text-[10px] uppercase tracking-[3px] text-foreground/55 font-[family-name:var(--font-rajdhani)] font-medium mb-5">
          {eyebrow}
        </p>
      )}
      <div className="relative aspect-square w-full overflow-hidden bg-card/60 mb-5">
        {product.featuredImage && (
          <Image
            src={product.featuredImage.url}
            alt={product.featuredImage.altText || product.title}
            fill
            sizes="(max-width: 768px) 90vw, 600px"
            className="object-contain p-8 transition-transform duration-700 ease-out group-hover:scale-105"
          />
        )}
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-[10px] uppercase tracking-[2px] text-foreground/55 font-[family-name:var(--font-rajdhani)]">
          {product.vendor}
        </p>
        <h3 className="text-lg md:text-xl font-medium leading-snug transition-colors duration-300 group-hover:text-foreground/70">
          {product.title}
        </h3>
        {priceLabel && (
          <p className="text-base font-semibold mt-2">{priceLabel}</p>
        )}
        <span className="inline-flex items-center gap-1.5 mt-4 text-[11px] uppercase tracking-[3px] font-[family-name:var(--font-rajdhani)] font-medium text-foreground/80 transition-colors duration-300 group-hover:text-foreground">
          {ctaLabel}
          <span aria-hidden="true">&rarr;</span>
        </span>
      </div>
    </Link>
  );
}
