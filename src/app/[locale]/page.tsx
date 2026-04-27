import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { commerce } from "@/lib/commerce";
import { isProductOnSale } from "@/lib/commerce/sale";
import { localeCountryMap, type Locale } from "@/i18n/config";
import { getHeroSlides } from "@/lib/hero-slides";
import { siteConfig } from "@/lib/site-config";
import { cloudinaryUrl, cloudinaryVideoUrl } from "@/lib/cloudinary";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEs = locale === "es";
  const title = isEs
    ? "Folka Coffee | Equipo Premium para Café"
    : "Folka Coffee | Premium Coffee Equipment";
  const description = isEs
    ? "Importadores oficiales de Rocket Espresso, Profitec, Mazzer, Fellow y más. Equipo premium para el barista exigente."
    : "Official importers of Rocket Espresso, Profitec, Mazzer, Fellow & more. Premium coffee equipment for the discerning barista.";
  const url = `${siteConfig.siteUrl}/${locale}`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      locale: isEs ? "es_MX" : "en_US",
      alternateLocale: isEs ? "en_US" : "es_MX",
    },
    twitter: {
      title,
      description,
    },
    alternates: {
      canonical: url,
      languages: { en: "/en", es: "/es" },
    },
  };
}

import { HeroCarousel } from "@/components/sections/hero-carousel";
import { CategoryNavigation } from "@/components/sections/category-navigation";
import { EditorialMoment } from "@/components/sections/editorial-moment";
import { ProductCarousel } from "@/components/sections/product-carousel";
import { BrandLogos } from "@/components/sections/brand-logos";
import { Reviews } from "@/components/sections/reviews";
import { TrustStrip } from "@/components/sections/trust-strip";
import { CommercialCta } from "@/components/sections/commercial-cta";
import { JournalFeature } from "@/components/journal/journal-feature";
import { getAllJournalPosts } from "@/lib/content/journal";
import { StoriesFeature } from "@/components/stories/stories-feature";
import { getAllStories } from "@/lib/content/stories";
import { Newsletter } from "@/components/sections/newsletter";
import { ClosingCta } from "@/components/sections/closing-cta";

export const revalidate = 120;

const categoryKeys = [
  { key: "espresso", href: "/collections/espresso-machines", imageUrl: "/icons/ic_espresso.webp" },
  { key: "grinders", href: "/collections/domestic-grinders", imageUrl: "/icons/ic_grinders.webp" },
  { key: "brewing", href: "/collections/brewing", imageUrl: "/icons/ic_brewing.webp" },
  { key: "accessories", href: "/collections/coffee-bar-accessories", imageUrl: "/icons/ic_accesories.webp" },
  { key: "coffee", href: "/collections/cafe", imageUrl: "/icons/ic_coffee.webp" },
  { key: "care", href: "/collections/cleaning-stuff", imageUrl: "/icons/ic_care.webp" },
] as const;

const brands = [
  { name: "Rocket", href: "/collections/rocket" },
  { name: "Profitec", href: "/collections/profitec" },
  { name: "La Marzocco", href: "/collections/la-marzocco" },
  { name: "Slayer", href: "/collections/slayer" },
  { name: "Mazzer", href: "/collections/mazzer" },
  { name: "Fellow", href: "/collections/fellow" },
  { name: "Eureka", href: "/collections/eureka" },
  { name: "Breville", href: "/collections/breville" },
  { name: "Rancilio", href: "/collections/rancilio" },
  { name: "Niche", href: "/collections/niche-coffee-ltd" },
  { name: "Mahlkönig", href: "/collections/mahlkonig" },
  { name: "Acaia", href: "/collections/acaia" },
];

// Locale-independent review metadata: video URL, poster image, café name.
// Text/author/role come from i18n. Assets are served from Cloudinary
// (`folka/reviews/*`). Leave `videoUrl` empty to fall back to the
// pull-quote layout per slide.
const reviewsMeta = [
  {
    key: "review1",
    videoUrl: cloudinaryVideoUrl("folka/reviews/testimonial-1"),
    image: cloudinaryUrl("/reviews/posters/testimonial-1"),
    cafeName: "",
  },
  {
    key: "review2",
    videoUrl: cloudinaryVideoUrl("folka/reviews/testimonial-2"),
    image: cloudinaryUrl("/reviews/posters/testimonial-2"),
    cafeName: "",
  },
  {
    key: "review3",
    videoUrl: cloudinaryVideoUrl("folka/reviews/testimonial-3"),
    image: cloudinaryUrl("/reviews/posters/testimonial-3"),
    cafeName: "",
  },
] as const;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const { country, language } = localeCountryMap[locale as Locale] ?? localeCountryMap.es;

  const [
    saleCollection,
    newArrivals,
    homeBarCollection,
    baristaPicksCollection,
    journalPosts,
    stories,
  ] = await Promise.all([
    // Fetch a buffer because the `sale` collection in Shopify holds the
    // global on-sale set; in any given market only a subset has a real
    // discount (compareAtPrice > price). Filter post-fetch with
    // isProductOnSale, then trim to 4.
    commerce.getCollection("sale", {
      first: 16,
      country,
      language,
    }),
    commerce.getProducts({
      first: 4,
      sortKey: "CREATED_AT",
      reverse: true,
      country,
      language,
    }),
    commerce.getCollection("best-seller", {
      first: 8,
      country,
      language,
    }),
    commerce.getCollection("barista-picks", {
      first: 12,
      sortKey: "MANUAL",
      country,
      language,
    }),
    getAllJournalPosts(locale as Locale),
    getAllStories(locale as Locale),
  ]);

  const saleProducts = (saleCollection?.products ?? [])
    .filter(isProductOnSale)
    .slice(0, 4);
  const showSale = saleProducts.length > 0;

  const heroSlides = getHeroSlides(locale as Locale);

  const reviews = reviewsMeta.map(({ key, videoUrl, image, cafeName }) => ({
    text: t(`testimonials.${key}Text`),
    author: t(`testimonials.${key}Author`),
    role: t(`testimonials.${key}Role`),
    videoUrl: videoUrl || undefined,
    image: image || undefined,
    cafeName: cafeName || undefined,
  }));

  return (
    <>
      {/* 1. Hero Carousel — editorial chapters */}
      <HeroCarousel
        slides={heroSlides}
        dragHint={t("home.heroDragHint")}
        prevLabel={t("home.heroPrev")}
        nextLabel={t("home.heroNext")}
      />

      {/* 2. On Sale (or New Arrivals fallback) — above-the-fold taster */}
      {showSale ? (
        <ProductCarousel
          eyebrow={t("home.onSale")}
          title={t("home.onSaleTitle")}
          description={t("home.onSaleDescription")}
          viewAllText={t("common.viewAll")}
          viewAllHref="/collections/sale"
          products={saleProducts}
          layout="grid"
        />
      ) : (
        <ProductCarousel
          eyebrow={t("home.newArrivals")}
          title={t("home.newArrivalsTitle")}
          description={t("home.newArrivalsDescription")}
          viewAllText={t("common.viewAll")}
          viewAllHref="/new-arrivals"
          products={newArrivals}
          layout="grid"
        />
      )}

      {/* 3. Category Navigation — "keep exploring" after a first product taste */}
      <CategoryNavigation
        eyebrow={t("categories.eyebrow")}
        title={t("categories.title")}
        description={t("categories.description")}
        categories={categoryKeys.map(({ key, href, imageUrl }) => ({
          label: t(`categories.${key}` as Parameters<typeof t>[0]),
          href,
          imageUrl,
        }))}
      />

      {/* 4. Editorial Moment — video/image full-bleed storytelling */}
      <EditorialMoment
        eyebrow={t("home.editorialEyebrow")}
        title={t("home.editorialTitle")}
        description={t("home.editorialDescription")}
        ctaText={t("common.explore")}
        ctaHref="/collections/maquinaria"
        imageUrl="/backs/complete_system.webp"
        imageAlt={t("home.editorialTitle")}
      />

      {/* 5. Home Bar Favorites — curated bestsellers */}
      {homeBarCollection && (
        <ProductCarousel
          eyebrow={t("home.homeBarEyebrow")}
          title={t("home.homeBarTitle")}
          description={t("home.homeBarDescription")}
          viewAllText={t("home.homeBarViewAll")}
          viewAllHref="/collections/best-seller"
          products={homeBarCollection.products}
        />
      )}

      {/* 6. Brand Logos — credibility strip */}
      <BrandLogos
        eyebrow={t("home.trustedBy")}
        brands={brands}
      />

      {/* 7. Stories — editorial portraits of partner cafés (3-up magazine spread) */}
      <StoriesFeature
        eyebrow={t("home.storiesFeatureEyebrow")}
        title={t("home.storiesFeatureTitle")}
        description={t("home.storiesFeatureDescription")}
        viewAllText={t("home.storiesFeatureViewAll")}
        readLabel={t("stories.readStory")}
        stories={stories.slice(0, 3)}
      />

      {/* 8. Reviews — social proof with stars */}
      <Reviews
        eyebrow={t("home.reviewsEyebrow")}
        reviews={reviews}
      />

      {/* 9. Barista Picks — curated equipment chosen by working pros */}
      {baristaPicksCollection && (
        <ProductCarousel
          eyebrow={t("home.baristaPicksEyebrow")}
          title={t("home.baristaPicksTitle")}
          description={t("home.baristaPicksDescription")}
          viewAllText={t("home.baristaPicksViewAll")}
          viewAllHref="/collections/barista-picks"
          products={baristaPicksCollection.products}
        />
      )}

      {/* 10. Trust Strip — editorial hairline row */}
      <TrustStrip
        labels={[
          t("home.trustShipping"),
          t("home.trustService"),
          t("home.trustPayment"),
          t("home.trustSca"),
        ]}
      />

      {/* 11. Commercial CTA — B2B, café consulting */}
      <CommercialCta
        eyebrow={t("home.commercialEyebrow")}
        title={t("home.commercialTitle")}
        description={t("home.commercialText")}
        ctaText={t("common.contact")}
        ctaHref="/pages/contact"
        imageUrl="/backs/build_cafe.webp"
        imageAlt={t("home.commercialTitle")}
        stats={[
          {
            value: t("home.commercialStat1Value"),
            label: t("home.commercialStat1Label"),
          },
          {
            value: t("home.commercialStat2Value"),
            label: t("home.commercialStat2Label"),
          },
          {
            value: t("home.commercialStat3Value"),
            label: t("home.commercialStat3Label"),
          },
        ]}
      />

      {/* 12. Journal — editorial content from the in-house journal */}
      <JournalFeature
        eyebrow={t("home.journalFeatureEyebrow")}
        title={t("home.journalFeatureTitle")}
        description={t("home.journalFeatureDescription")}
        viewAllText={t("home.journalFeatureViewAll")}
        posts={journalPosts.slice(0, 3)}
        locale={locale as Locale}
        minReadLabel={t("journal.minRead")}
      />


      {/* 13. Newsletter — email capture */}
      <Newsletter
        eyebrow={t("home.newsletterEyebrow")}
        title={t("home.newsletterTitle")}
        description={t("home.newsletterDescription")}
        placeholder={t("home.newsletterPlaceholder")}
        buttonText={t("home.newsletterButton")}
        successMessage={t("home.newsletterSuccess")}
      />

      {/* 14. Closing CTA — cinematic closing moment over brand imagery */}
      <ClosingCta
        eyebrow={t("home.ctaSubheading")}
        title={t("home.ctaTitle")}
        description={t("home.ctaDescription")}
        ctaText={t("common.shopNow")}
        ctaHref="/shop"
        imageUrl="/banners/hf_20260424_231041_d5c47494-e52b-47a5-9c34-43f15ba71b58.webp"
        imageAlt={t("home.ctaTitle")}
      />
    </>
  );
}
