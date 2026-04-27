import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/ui/icon";
import type { Locale } from "@/i18n/config";
import { getAllStories } from "@/lib/content/stories";
import { StoryCard } from "@/components/stories/story-card";
import { siteConfig } from "@/lib/site-config";

export const revalidate = 300;

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "stories" });
  const url = `${siteConfig.siteUrl}/${locale}/stories`;
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
      languages: { en: "/en/stories", es: "/es/stories" },
    },
  };
}

export default async function StoriesIndexPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const localeTyped = locale as Locale;
  const t = await getTranslations();

  const stories = await getAllStories(localeTyped);
  const readLabel = t("stories.readStory");

  return (
    <section className="py-20 md:py-28 lg:py-32">
      <div className="container-page">
        {/* Masthead — matches ProductCarousel vocabulary (asymmetric 12-col) */}
        <div className="grid md:grid-cols-12 gap-8 md:gap-12 mb-14 md:mb-20">
          <div className="md:col-span-8">
            <p className="text-[11px] uppercase tracking-[4px] font-medium font-[family-name:var(--font-rajdhani)] text-foreground/50 mb-6 md:mb-8">
              {t("stories.indexEyebrow")}
            </p>
            <h1
              className="text-4xl md:text-5xl lg:text-6xl tracking-tight font-[family-name:var(--font-rajdhani)] leading-[1.02] max-w-2xl"
              style={{ fontWeight: 300 }}
            >
              {t("stories.indexTitle")}
            </h1>
          </div>
          <div className="md:col-span-4 md:self-end flex flex-col gap-6">
            <p className="text-[15px] text-foreground/60 leading-relaxed max-w-sm">
              {t("stories.indexDescription")}
            </p>
            <Link
              href="/pages/about"
              className="inline-flex items-center gap-3 self-start text-[11px] uppercase tracking-[3px] font-semibold font-[family-name:var(--font-rajdhani)] text-foreground hover:gap-4 transition-all duration-300"
            >
              {t("stories.indexAbout")}
              <Icon name="arrow-right" size={14} />
            </Link>
          </div>
        </div>

        {stories.length === 0 ? (
          // Empty-state — registry has zero stories. Editorial framing,
          // no error chrome.
          <div className="py-20 md:py-28 text-center max-w-xl mx-auto">
            <p className="text-[11px] uppercase tracking-[4px] font-medium font-[family-name:var(--font-rajdhani)] text-foreground/50">
              {t("stories.emptyEyebrow")}
            </p>
            <h2
              className="text-3xl md:text-4xl lg:text-5xl tracking-tight font-[family-name:var(--font-rajdhani)] leading-[1.05] mt-5"
              style={{ fontWeight: 300 }}
            >
              {t("stories.emptyTitle")}
            </h2>
            <p className="text-[15px] text-foreground/60 leading-relaxed mt-5">
              {t("stories.emptyDescription")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {stories.map((story) => (
              <StoryCard
                key={story.slug}
                slug={story.slug}
                eyebrow={story.eyebrow}
                title={story.title}
                description={story.description}
                cafe={story.cafe}
                coverImage={story.coverImage}
                teaserVideo={story.teaserVideo}
                readLabel={readLabel}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
