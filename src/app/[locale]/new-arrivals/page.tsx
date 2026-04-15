import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { commerce } from "@/lib/commerce";
import { localeCountryMap, type Locale } from "@/i18n/config";
import { ProductCard } from "@/components/product/product-card";

export const revalidate = 120;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return { title: t("home.newArrivals") };
}

export default async function NewArrivalsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const { country, language } = localeCountryMap[locale as Locale] ?? localeCountryMap.es;

  const products = await commerce.getProducts({
    first: 24,
    sortKey: "CREATED_AT",
    reverse: true,
    country,
    language,
  });

  return (
    <div className="container-page py-12 md:py-20">
      <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-10 md:mb-14 font-[family-name:var(--font-rajdhani)]">
        {t("home.newArrivals")}
      </h1>

      {products.length === 0 ? (
        <p className="text-muted">{t("product.noProducts")}</p>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
