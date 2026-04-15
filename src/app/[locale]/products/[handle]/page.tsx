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

export const revalidate = 60;

interface Props {
  params: Promise<{ handle: string; locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle, locale } = await params;
  const { country, language } = localeCountryMap[locale as Locale] ?? localeCountryMap.es;
  const product = await commerce.getProduct(handle, { country, language });
  if (!product) return {};

  const ogImages = product.featuredImage
    ? [{ url: product.featuredImage.url, width: product.featuredImage.width, height: product.featuredImage.height, alt: product.title }]
    : [];

  return {
    title: product.seo.title,
    description: product.seo.description,
    openGraph: {
      title: product.seo.title,
      description: product.seo.description,
      images: ogImages,
      type: "website",
    },
    alternates: {
      canonical: `${siteConfig.siteUrl}/${locale}/products/${handle}`,
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
