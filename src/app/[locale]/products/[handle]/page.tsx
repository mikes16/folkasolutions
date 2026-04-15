import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { commerce } from "@/lib/commerce";
import { getTranslations } from "next-intl/server";
import { ProductDetail } from "@/components/product/product-detail";
import { ProductCard } from "@/components/product/product-card";
import { ProductBreadcrumbs } from "@/components/product/product-breadcrumbs";
import { getCuratedCategoryForProduct } from "@/lib/product-category-mapping";
import { localeCountryMap, type Locale } from "@/i18n/config";
import { siteConfig } from "@/lib/site-config";
import { ProductViewedTracker } from "@/components/product/product-viewed-tracker";

export const revalidate = 60;

interface Props {
  params: Promise<{ handle: string; locale: string }>;
}

// Transforms a Shopify CDN image URL to a 1200x630 JPG crop optimized for
// social previews (WhatsApp, X, Facebook, iMessage). Shopify CDN accepts
// width/height/crop query params and honors them for the original asset.
function toSocialPreviewUrl(url: string): string {
  try {
    const u = new URL(url);
    u.searchParams.set("width", "1200");
    u.searchParams.set("height", "630");
    u.searchParams.set("crop", "center");
    return u.toString();
  } catch {
    return url;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle, locale } = await params;
  const { country, language } = localeCountryMap[locale as Locale] ?? localeCountryMap.es;
  const product = await commerce.getProduct(handle, { country, language });
  if (!product) return {};

  const productUrl = `${siteConfig.siteUrl}/${locale}/products/${handle}`;
  const variant = product.variants[0];
  const ogImages = product.featuredImage
    ? [
        {
          url: toSocialPreviewUrl(product.featuredImage.url),
          width: 1200,
          height: 630,
          alt: product.title,
        },
      ]
    : [];

  const ogLocale = locale === "en" ? "en_US" : "es_MX";
  const alternateLocale = locale === "en" ? "es_MX" : "en_US";

  return {
    title: product.seo.title,
    description: product.seo.description,
    openGraph: {
      title: product.seo.title,
      description: product.seo.description,
      url: productUrl,
      siteName: "Folka Coffee",
      images: ogImages,
      type: "website",
      locale: ogLocale,
      alternateLocale,
    },
    twitter: {
      card: "summary_large_image",
      title: product.seo.title,
      description: product.seo.description,
      images: ogImages.map((img) => img.url),
    },
    other: variant
      ? {
          "product:price:amount": variant.price.amount,
          "product:price:currency": variant.price.currencyCode,
          "product:availability": product.availableForSale
            ? "in stock"
            : "out of stock",
          "product:brand": product.vendor ?? "Folka Coffee",
        }
      : undefined,
    alternates: {
      canonical: productUrl,
      languages: { en: `/en/products/${handle}`, es: `/es/products/${handle}` },
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { handle, locale } = await params;
  setRequestLocale(locale);
  const { country, language } = localeCountryMap[locale as Locale] ?? localeCountryMap.es;
  const t = await getTranslations();
  const product = await commerce.getProduct(handle, { country, language });

  if (!product) notFound();

  // Fetch related products by same vendor, excluding current product
  const relatedProducts = await commerce.getProducts({
    first: 5,
    query: product.vendor ? `vendor:${product.vendor}` : undefined,
    country,
    language,
  }).then((products) =>
    products.filter((p) => p.handle !== handle).slice(0, 4)
  );

  const variant = product.variants[0];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.images.map((img) => img.url),
    brand: { "@type": "Brand", name: product.vendor },
    ...(variant && {
      offers: {
        "@type": "Offer",
        url: `${siteConfig.siteUrl}/${locale}/products/${handle}`,
        priceCurrency: variant.price.currencyCode,
        price: variant.price.amount,
        availability: product.availableForSale
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      },
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductViewedTracker
        productId={product.id}
        productTitle={product.title}
        vendor={product.vendor}
        price={variant?.price.amount ?? ""}
        currency={variant?.price.currencyCode ?? ""}
        availableForSale={product.availableForSale}
      />
      <div className="container-page py-6 md:py-12">
        <ProductBreadcrumbs
          homeLabel={t("breadcrumbs.home")}
          productTitle={product.title}
          defaultCategory={(() => {
            const category = getCuratedCategoryForProduct(product);
            return category
              ? { labelKey: category.labelKey, handle: category.handle }
              : null;
          })()}
        />
        <ProductDetail product={product} />
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="container-page pb-12 md:pb-16">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-8">
            {t("product.relatedProducts")}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
