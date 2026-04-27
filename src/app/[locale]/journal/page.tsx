import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/ui/icon";
import type { Locale } from "@/i18n/config";
import { getAllJournalPosts } from "@/lib/content/journal";
import { JournalCard } from "@/components/journal/journal-card";
import { formatJournalDate } from "@/components/journal/format-date";
import { siteConfig } from "@/lib/site-config";

export const revalidate = 300;

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "journal" });
  const url = `${siteConfig.siteUrl}/${locale}/journal`;
  const isEs = locale === "es";
  return {
    title: t("indexTitle"),
    description: t("indexDescription"),
    openGraph: {
      title: t("indexTitle"),
      description: t("indexDescription"),
      url,
      locale: isEs ? "es_MX" : "en_US",
      alternateLocale: isEs ? "en_US" : "es_MX",
      type: "website",
    },
    alternates: {
      canonical: url,
      languages: { en: "/en/journal", es: "/es/journal" },
    },
  };
}

export default async function JournalIndexPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const localeTyped = locale as Locale;

  const posts = await getAllJournalPosts(localeTyped);

  if (posts.length === 0) {
    return (
      <div className="container-page py-32">
        <p className="text-foreground/60 text-center">
          {t("journal.emptyState")}
        </p>
      </div>
    );
  }

  const [featured, ...rest] = posts;
  const minReadLabel = t("journal.minRead");

  return (
    <>
      {/* Masthead — matches ProductCarousel vocabulary */}
      <section className="py-20 md:py-28 lg:py-32">
        <div className="container-page">
          <div className="grid md:grid-cols-12 gap-8 md:gap-12 mb-14 md:mb-20">
            <div className="md:col-span-8">
              <p className="text-[11px] uppercase tracking-[4px] font-medium font-[family-name:var(--font-rajdhani)] text-foreground/50 mb-6 md:mb-8">
                {t("journal.indexEyebrow")}
              </p>
              <h1
                className="text-4xl md:text-5xl lg:text-6xl tracking-tight font-[family-name:var(--font-rajdhani)] leading-[1.02] max-w-2xl"
                style={{ fontWeight: 300 }}
              >
                {t("journal.indexTitle")}
              </h1>
            </div>
            <div className="md:col-span-4 md:self-end flex flex-col gap-6">
              <p className="text-[15px] text-foreground/60 leading-relaxed max-w-sm">
                {t("journal.indexDescription")}
              </p>
              <Link
                href="/pages/about"
                className="inline-flex items-center gap-3 self-start text-[11px] uppercase tracking-[3px] font-semibold font-[family-name:var(--font-rajdhani)] text-foreground hover:gap-4 transition-all duration-300"
              >
                {t("journal.aboutAuthor")}
                <Icon name="arrow-right" size={14} />
              </Link>
            </div>
          </div>

          {/* Featured post — full-width hero card */}
          <Link
            href={`/journal/${featured.slug}`}
            className="group grid md:grid-cols-12 gap-8 md:gap-12 mb-20 md:mb-28"
          >
            <div className="md:col-span-7 relative aspect-[16/9] overflow-hidden bg-card/60">
              <Image
                src={featured.coverImage.url}
                alt={featured.coverImage.alt}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 60vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
            </div>
            <div className="md:col-span-5 md:self-center flex flex-col">
              <p className="text-[11px] uppercase tracking-[3px] font-medium font-[family-name:var(--font-rajdhani)] text-foreground/55">
                {featured.eyebrow}
              </p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-[300] tracking-tight font-[family-name:var(--font-rajdhani)] mt-5 leading-[1.05] group-hover:text-foreground/70 transition-colors">
                {featured.title}
              </h2>
              <p className="text-base md:text-lg text-foreground/65 leading-relaxed mt-6 max-w-md">
                {featured.description}
              </p>
              <p className="text-[11px] uppercase tracking-[2.5px] text-foreground/50 mt-8 font-[family-name:var(--font-rajdhani)]">
                {formatJournalDate(featured.publishedAt, localeTyped)}
                <span aria-hidden="true"> · </span>
                {featured.readingTimeMinutes} {minReadLabel}
              </p>
              <span className="inline-flex items-center gap-3 mt-8 text-[11px] uppercase tracking-[3px] font-semibold font-[family-name:var(--font-rajdhani)] text-foreground group-hover:gap-4 transition-all duration-300">
                {t("journal.readArticle")}
                <Icon name="arrow-right" size={14} />
              </span>
            </div>
          </Link>

          {/* Remaining posts — 2-col grid that grows as the registry fills */}
          {rest.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14">
              {rest.map((post) => (
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
          )}
        </div>
      </section>
    </>
  );
}
