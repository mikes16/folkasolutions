import Image from "next/image";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { commerce } from "@/lib/commerce";
import { CURATED_CATEGORIES } from "@/lib/curated-categories";
import { localeCountryMap, type Locale } from "@/i18n/config";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Collections" };
}

export default async function CollectionsIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const { country, language } = localeCountryMap[locale as Locale] ?? localeCountryMap.es;

  const allCollections = await commerce.getCollections({ first: 250, country, language });
  const handleMap = new Map(allCollections.map((c) => [c.handle, c]));

  const categories = CURATED_CATEGORIES
    .map((cat) => ({ config: cat, collection: handleMap.get(cat.handle) }))
    .filter((entry): entry is { config: typeof entry.config; collection: NonNullable<typeof entry.collection> } =>
      !!entry.collection
    );

  return (
    <div className="container-page py-12">
      <h1 className="text-3xl md:text-5xl font-bold tracking-tight font-[family-name:var(--font-rajdhani)]">
        {t("collections.shopByCategory")}
      </h1>
      <p className="text-muted mt-3 mb-10 max-w-2xl">
        {t("collections.shopByCategoryDescription")}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
        {categories.map(({ config, collection }) => (
          <Link
            key={collection.id}
            href={`/collections/${collection.handle}`}
            className="group relative aspect-square md:aspect-[4/3] rounded-2xl md:rounded-[24px] overflow-hidden bg-white"
          >
            {collection.image?.url ? (
              <Image
                src={collection.image.url}
                alt={t(config.labelKey)}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            ) : (
              <div className="w-full h-full bg-border/20" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-3 md:p-5">
              <h2 className="text-white text-xs md:text-lg font-bold tracking-[0.12em] uppercase font-[family-name:var(--font-rajdhani)] leading-tight">
                {t(config.labelKey)}
              </h2>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
