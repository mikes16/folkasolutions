import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { commerce } from "@/lib/commerce";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CollectionContextSetter } from "@/components/collection/collection-context-setter";
import { SortSelect } from "@/components/collection/sort-select";
import { LoadMoreProducts } from "@/components/collection/load-more-products";
import { FilterBar } from "@/components/product/filter-bar";
import { parseSortParam } from "@/lib/commerce/sort";
import { parseFilterParams } from "@/lib/commerce/filters";
import { collectionSchema } from "@/lib/seo/schemas";
import { localeCountryMap, type Locale } from "@/i18n/config";
import { siteConfig } from "@/lib/site-config";

export const revalidate = 60;

interface Props {
  params: Promise<{ handle: string; locale: string }>;
  searchParams: Promise<{
    sort?: string;
    brand?: string;
    type?: string;
    price?: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle, locale } = await params;
  const { country, language } = localeCountryMap[locale as Locale] ?? localeCountryMap.es;
  const collection = await commerce.getCollection(handle, { country, language });
  if (!collection) return {};

  return {
    title: collection.seo.title,
    description: collection.seo.description,
    openGraph: {
      title: collection.seo.title,
      description: collection.seo.description,
      ...(collection.image && { images: [{ url: collection.image.url }] }),
    },
    alternates: {
      canonical: `${siteConfig.siteUrl}/${locale}/collections/${handle}`,
      languages: { en: `/en/collections/${handle}`, es: `/es/collections/${handle}` },
    },
  };
}

export default async function CollectionPage({ params, searchParams }: Props) {
  const { handle, locale } = await params;
  const { sort = "", brand, type, price } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations();
  const { country, language, currency } = localeCountryMap[locale as Locale] ?? localeCountryMap.es;
  const { sortKey, reverse } = parseSortParam(sort);
  const filters = parseFilterParams({ brand, type, price }, currency);

  const [collection, facets] = await Promise.all([
    commerce.getCollection(handle, {
      first: 40,
      sortKey,
      reverse,
      country,
      language,
      filters,
    }),
    commerce.getCollectionFacets(handle, { country, language }),
  ]);

  if (!collection) notFound();

  const filterKey = `${sort}|${filters.brands.join(",")}|${filters.typeIds.join(",")}|${filters.priceBucketId ?? ""}`;

  return (
    <div className="container-page py-12">
      <CollectionContextSetter title={collection.title} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema(collection, locale)) }}
      />
      <Breadcrumbs
        items={[
          { label: t("breadcrumbs.home"), href: "/" },
          { label: t("collections.title"), href: "/collections" },
          { label: collection.title },
        ]}
      />

      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          {collection.title}
        </h1>
        {collection.description && (
          <p className="text-muted mt-3 max-w-2xl">{collection.description}</p>
        )}
      </div>

      <FilterBar
        state={filters}
        currency={currency}
        availableFacets={{
          vendors: facets.vendors,
          productTypes: facets.productTypes,
        }}
      >
        <SortSelect currentSort={sort} />
      </FilterBar>

      {collection.products.length > 0 ? (
        <LoadMoreProducts
          key={filterKey}
          initialProducts={collection.products}
          initialPageInfo={collection.pageInfo}
          collectionHandle={handle}
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
