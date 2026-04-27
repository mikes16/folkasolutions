import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/ui/icon";
import { locales, type Locale } from "@/i18n/config";
import {
  getAllStories,
  getAllStorySlugs,
  getStory,
} from "@/lib/content/stories";
import { cloudinaryUrl } from "@/lib/cloudinary";
import { StoryHero } from "@/components/stories/story-hero";
import { StoryEquipmentBlock } from "@/components/stories/story-equipment-block";
import { StoryCafeCard } from "@/components/stories/story-cafe-card";
import { StoryCard } from "@/components/stories/story-card";
import { siteConfig } from "@/lib/site-config";

export const revalidate = 300;

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export function generateStaticParams() {
  const slugs = getAllStorySlugs();
  return locales.flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const localeTyped = locale as Locale;
  const story = await getStory(slug, localeTyped);
  if (!story) return {};

  const { frontmatter } = story;
  const url = `${siteConfig.siteUrl}/${locale}/stories/${slug}`;
  const isEs = locale === "es";
  const ogImage = cloudinaryUrl(frontmatter.coverImage.url);

  return {
    title: frontmatter.title,
    description: frontmatter.description,
    openGraph: {
      title: frontmatter.title,
      description: frontmatter.description,
      url,
      locale: isEs ? "es_MX" : "en_US",
      alternateLocale: isEs ? "en_US" : "es_MX",
      type: "article",
      publishedTime: frontmatter.publishedAt,
      modifiedTime: frontmatter.updatedAt ?? frontmatter.publishedAt,
      ...(frontmatter.author?.name
        ? { authors: [frontmatter.author.name] }
        : {}),
      tags: frontmatter.tags,
      images: [
        {
          url: ogImage,
          alt: frontmatter.coverImage.alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: frontmatter.title,
      description: frontmatter.description,
      images: [ogImage],
    },
    alternates: {
      canonical: url,
      languages: {
        en: `/en/stories/${slug}`,
        es: `/es/stories/${slug}`,
      },
    },
  };
}

export default async function StoryDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const localeTyped = locale as Locale;
  const story = await getStory(slug, localeTyped);
  if (!story) notFound();

  const { frontmatter, Body } = story;
  const t = await getTranslations();

  const coverImageUrl = cloudinaryUrl(frontmatter.coverImage.url);
  const pageUrl = `${siteConfig.siteUrl}/${locale}/stories/${slug}`;
  const readLabel = t("stories.readStory");

  // JSON-LD: Article + a nested Place describing the café being profiled.
  // This is the schema search engines reach for when Articles are about a
  // specific business location.
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: frontmatter.title,
    description: frontmatter.description,
    image: [coverImageUrl],
    datePublished: frontmatter.publishedAt,
    dateModified: frontmatter.updatedAt ?? frontmatter.publishedAt,
    ...(frontmatter.author?.name
      ? {
          author: {
            "@type": "Person",
            name: frontmatter.author.name,
          },
        }
      : {}),
    publisher: {
      "@type": "Organization",
      name: "Folka Coffee Solutions",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": pageUrl,
    },
    about: {
      "@type": "CafeOrCoffeeShop",
      name: frontmatter.cafe.name,
      address: {
        "@type": "PostalAddress",
        addressLocality: frontmatter.cafe.city,
        addressCountry: frontmatter.cafe.country,
      },
      ...(frontmatter.cafe.website ? { url: frontmatter.cafe.website } : {}),
    },
    keywords: frontmatter.tags.join(", "),
  };

  const allStories = await getAllStories(localeTyped);
  const moreStories = allStories.filter((s) => s.slug !== slug).slice(0, 2);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <StoryHero
        eyebrow={frontmatter.eyebrow}
        title={frontmatter.title}
        cafe={frontmatter.cafe}
        coverImage={frontmatter.coverImage}
        mainVideo={frontmatter.mainVideo}
      />

      {/* BODY — single editorial column. Stories lean narrative, so we
          forgo the journal's sticky meta sidebar in favor of more breathing
          room around the prose. */}
      <article
        lang={localeTyped}
        className="container-page py-16 md:py-24"
      >
        <div className="max-w-prose mx-auto">
          <Body />
        </div>
      </article>

      {frontmatter.featuredProductHandles.length > 0 && (
        <StoryEquipmentBlock
          handles={frontmatter.featuredProductHandles}
          eyebrow={t("stories.equipmentEyebrow")}
          title={t("stories.equipmentTitle")}
        />
      )}

      <section className="container-page py-20 md:py-28">
        <StoryCafeCard
          cafe={frontmatter.cafe}
          visitLabel={t("stories.cafeVisit")}
          igLabel={t("stories.cafeInstagram")}
          websiteLabel={t("stories.cafeWebsite")}
        />
      </section>

      {/* Only render the rail when we have a full 2-up row to fill — a single
          card looks orphaned in the 2-col grid. */}
      {moreStories.length >= 2 && (
        <section className="container-page py-20 md:py-28">
          <div className="flex items-end justify-between mb-12 md:mb-16">
            <h2
              className="text-3xl md:text-4xl tracking-tight font-[family-name:var(--font-rajdhani)] leading-[1.05]"
              style={{ fontWeight: 300 }}
            >
              {t("stories.moreStories")}
            </h2>
            <Link
              href="/stories"
              className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[3px] font-semibold font-[family-name:var(--font-rajdhani)] text-foreground hover:gap-4 transition-all duration-300"
            >
              {t("stories.indexEyebrow")}
              <Icon name="arrow-right" size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {moreStories.map((other) => (
              <StoryCard
                key={other.slug}
                slug={other.slug}
                eyebrow={other.eyebrow}
                title={other.title}
                description={other.description}
                cafe={other.cafe}
                coverImage={other.coverImage}
                teaserVideo={other.teaserVideo}
                readLabel={readLabel}
              />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
