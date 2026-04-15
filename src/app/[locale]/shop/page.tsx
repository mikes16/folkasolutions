import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { commerce } from "@/lib/commerce";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { SortSelect } from "@/components/collection/sort-select";
import { LoadMoreShopProducts } from "@/components/shop/load-more-shop-products";
import { FilterBar } from "@/components/product/filter-bar";
import { parseShopSortParam } from "@/lib/commerce/sort";
import { parseFilterParams } from "@/lib/commerce/filters";
import { localeCountryMap, type Locale } from "@/i18n/config";
import { siteConfig } from "@/lib/site-config";

export const revalidate = 60;

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    sort?: string;
    brand?: string;
    type?: string;
    price?: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return {
    title: t("shop.title"),
    description: t("shop.description"),
    alternates: {
      canonical: `${siteConfig.siteUrl}/${locale}/shop`,
      languages: { en: "/en/shop", es: "/es/shop" },
    },
  };
}

export default async function ShopPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { sort = "", brand, type, price } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations();
  const { country, language, currency } = localeCountryMap[locale as Locale] ?? localeCountryMap.es;
  const { sortKey, reverse } = parseShopSortParam(sort);
  const filters = parseFilterParams({ brand, type, price }, currency);

  const page = await commerce.getProductsPage({
    first: 24,
    sortKey,
    reverse,
    country,
    language,
    filters,
  });

  const filterKey = `${sort}|${filters.brands.join(",")}|${filters.typeIds.join(",")}|${filters.priceBucketId ?? ""}`;

  return (
    <div className="container-page py-12">
      <Breadcrumbs
        items={[
          { label: t("breadcrumbs.home"), href: "/" },
          { label: t("shop.title") },
        ]}
      />

      <div className="mb-10">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight font-[family-name:var(--font-rajdhani)]">
          {t("shop.title")}
        </h1>
        <p className="text-muted mt-3 max-w-2xl">{t("shop.description")}</p>
      </div>

      <FilterBar state={filters} currency={currency}>
        <SortSelect currentSort={sort} />
      </FilterBar>

      {page.products.length > 0 ? (
        <LoadMoreShopProducts
          key={filterKey}
          initialProducts={page.products}
          initialPageInfo={page.pageInfo}
          sort={sort}
          country={country}
          language={language}
          brand={brand}
          type={type}
          price={price}
        />
      ) : (
        <p className="text-muted py-20 text-center">
          {t("product.noProducts")}
        </p>
      )}
    </div>
  );
}
