import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/ui/icon";
import { locales, type Locale } from "@/i18n/config";
import {
  getAllJournalPosts,
  getAllJournalSlugs,
  getJournalPost,
} from "@/lib/content/journal";
import { JournalCard } from "@/components/journal/journal-card";
import { JournalMeta } from "@/components/journal/journal-meta";
import { formatJournalDate } from "@/components/journal/format-date";
import { VideoEmbed } from "@/components/mdx/video-embed";
import { ProductCallout } from "@/components/mdx/product-callout";
import { siteConfig } from "@/lib/site-config";

export const revalidate = 300;

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export function generateStaticParams() {
  const slugs = getAllJournalSlugs();
  return locales.flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const localeTyped = locale as Locale;
  const post = await getJournalPost(slug, localeTyped);
  if (!post) return {};

  const { frontmatter } = post;
  const url = `${siteConfig.siteUrl}/${locale}/journal/${slug}`;
  const isEs = locale === "es";

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
      authors: [frontmatter.author.name],
      tags: frontmatter.tags,
      images: [
        {
          url: frontmatter.coverImage.url,
          alt: frontmatter.coverImage.alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: frontmatter.title,
      description: frontmatter.description,
      images: [frontmatter.coverImage.url],
    },
    alternates: {
      canonical: url,
      languages: {
        en: `/en/journal/${slug}`,
        es: `/es/journal/${slug}`,
      },
    },
  };
}

export default async function JournalDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const localeTyped = locale as Locale;
  const post = await getJournalPost(slug, localeTyped);
  if (!post) notFound();

  const { frontmatter, Body } = post;
  const t = await getTranslations();

  // JSON-LD Article schema for richer search/social previews.
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: frontmatter.title,
    description: frontmatter.description,
    image: [frontmatter.coverImage.url],
    datePublished: frontmatter.publishedAt,
    dateModified: frontmatter.updatedAt ?? frontmatter.publishedAt,
    author: {
      "@type": "Person",
      name: frontmatter.author.name,
      ...(frontmatter.author.affiliation
        ? {
            affiliation: {
              "@type": "Organization",
              name: frontmatter.author.affiliation,
            },
          }
        : {}),
    },
    publisher: {
      "@type": "Organization",
      name: "Folka Coffee Solutions",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteConfig.siteUrl}/${locale}/journal/${slug}`,
    },
    keywords: frontmatter.tags.join(", "),
  };

  const allPosts = await getAllJournalPosts(localeTyped);
  const moreInJournal = allPosts.filter((p) => p.slug !== slug).slice(0, 2);
  const minReadLabel = t("journal.minRead");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      {/* HERO — full-bleed cinematic header. Layered: cover image background +
          editorial overlay with eyebrow / title / author stack. */}
      <header className="relative w-full overflow-hidden">
        <div className="relative aspect-[3/4] sm:aspect-[16/10] lg:aspect-[16/8] w-full">
          <Image
            src={frontmatter.coverImage.url}
            alt={frontmatter.coverImage.alt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/70"
          />
          <div className="absolute inset-0 flex items-end">
            <div className="container-page pb-12 md:pb-20 lg:pb-24 w-full">
              <div className="max-w-4xl">
                <p
                  className="text-[11px] uppercase tracking-[4px] font-medium font-[family-name:var(--font-rajdhani)] mb-6"
                  style={{ color: "var(--folka-mineral-sand)" }}
                >
                  {frontmatter.eyebrow}
                </p>
                <h1
                  className="font-[family-name:var(--font-rajdhani)] tracking-tight leading-[1.02] text-white"
                  style={{
                    fontWeight: 300,
                    fontSize: "clamp(2.25rem, 5vw, 5rem)",
                  }}
                >
                  {frontmatter.title}
                </h1>
                <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] uppercase tracking-[2.5px] font-[family-name:var(--font-rajdhani)] text-white/85">
                  <span>{frontmatter.author.name}</span>
                  <span aria-hidden="true">·</span>
                  <time dateTime={frontmatter.publishedAt}>
                    {formatJournalDate(frontmatter.publishedAt, localeTyped)}
                  </time>
                  <span aria-hidden="true">·</span>
                  <span>
                    {frontmatter.readingTimeMinutes} {minReadLabel}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Optional inline video — when the post has a Cloudinary embed, lift it
          right under the hero so it leads the reading flow. */}
      {frontmatter.videoEmbed && (
        <section className="container-page pt-16 md:pt-20">
          <VideoEmbed
            publicId={frontmatter.videoEmbed.publicId}
            aspect={frontmatter.videoEmbed.aspect}
            poster={frontmatter.videoEmbed.poster}
            controls
          />
        </section>
      )}

      {/* BODY — asymmetric grid: prose column + sticky meta sidebar */}
      <section className="container-page pb-24 md:pb-32">
        <div className="grid grid-cols-12 gap-8 md:gap-12">
          <article
            lang={localeTyped}
            className="col-span-12 lg:col-span-7 lg:col-start-2"
          >
            <Body />
          </article>
          <div className="col-span-12 lg:col-span-3 lg:col-start-10">
            <div className="lg:sticky lg:top-32">
              <JournalMeta
                author={frontmatter.author}
                publishedAt={frontmatter.publishedAt}
                readingTimeMinutes={frontmatter.readingTimeMinutes}
                locale={localeTyped}
                publishedLabel={t("journal.publishedOn")}
                readingTimeLabel={t("journal.minReadLong")}
              />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS — closing block referenced in the article */}
      {frontmatter.featuredProductHandles.length > 0 && (
        <section
          className="py-20 md:py-28"
          style={{
            backgroundColor: "var(--folka-midnight-blue)",
            color: "var(--folka-desert-white)",
          }}
        >
          <div className="container-page">
            <div className="max-w-[900px] mx-auto">
              <p
                className="text-[11px] uppercase tracking-[4px] font-medium font-[family-name:var(--font-rajdhani)] mb-12 text-center"
                style={{ color: "var(--folka-mineral-sand)" }}
              >
                {t("journal.relatedProducts")}
              </p>
              <div
                className={`grid gap-6 ${
                  frontmatter.featuredProductHandles.length > 1
                    ? "md:grid-cols-2"
                    : "md:grid-cols-1 max-w-md mx-auto"
                }`}
              >
                {frontmatter.featuredProductHandles.map((handle) => (
                  <ProductCallout key={handle} handle={handle} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* MORE IN JOURNAL */}
      {moreInJournal.length > 0 && (
        <section className="container-page py-20 md:py-28">
          <div className="flex items-end justify-between mb-12 md:mb-16">
            <h2
              className="text-3xl md:text-4xl tracking-tight font-[family-name:var(--font-rajdhani)] leading-[1.05]"
              style={{ fontWeight: 300 }}
            >
              {t("journal.moreInJournal")}
            </h2>
            <Link
              href="/journal"
              className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[3px] font-semibold font-[family-name:var(--font-rajdhani)] text-foreground hover:gap-4 transition-all duration-300"
            >
              {t("journal.indexEyebrow")}
              <Icon name="arrow-right" size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12">
            {moreInJournal.map((post) => (
              <JournalCard
                key={post.slug}
                slug={post.slug}
                eyebrow={post.eyebrow}
                title={post.title}
                description={post.description}
                publishedAt={post.publishedAt}
                readingTimeMinutes={post.readingTimeMinutes}
                coverImage={post.coverImage}
                locale={localeTyped}
                minReadLabel={minReadLabel}
                aspect="16/9"
              />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
