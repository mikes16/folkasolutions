import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { commerce } from "@/lib/commerce";
import { Icon } from "@/components/ui/icon";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { articleSchema } from "@/lib/seo/schemas";
import { localeCountryMap, type Locale } from "@/i18n/config";
import { siteConfig } from "@/lib/site-config";

export const revalidate = 120;

interface Props {
  params: Promise<{ blogHandle: string; articleHandle: string; locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { blogHandle, articleHandle, locale } = await params;
  const { country, language } = localeCountryMap[locale as Locale] ?? localeCountryMap.es;
  const article = await commerce.getArticle(blogHandle, articleHandle, { country, language });
  if (!article) return {};

  return {
    title: article.seo.title,
    description: article.seo.description,
    openGraph: {
      title: article.seo.title,
      description: article.seo.description,
      type: "article",
      publishedTime: article.publishedAt,
      authors: article.author.name ? [article.author.name] : undefined,
      ...(article.image && { images: [{ url: article.image.url }] }),
    },
    alternates: {
      canonical: `${siteConfig.siteUrl}/${locale}/blogs/${blogHandle}/${articleHandle}`,
      languages: {
        en: `/en/blogs/${blogHandle}/${articleHandle}`,
        es: `/es/blogs/${blogHandle}/${articleHandle}`,
      },
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { blogHandle, articleHandle, locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("blog");
  const { country, language } = localeCountryMap[locale as Locale] ?? localeCountryMap.es;

  const article = await commerce.getArticle(blogHandle, articleHandle, { country, language });
  if (!article) notFound();

  return (
    <article className="container-page py-12">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema(article, locale)) }}
          />
          <Breadcrumbs
            items={[
              { label: t("backToBlog"), href: `/blogs/${blogHandle}` },
              { label: article.title },
            ]}
          />

          {/* Back link */}
          <Link
            href={`/blogs/${blogHandle}`}
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[2px] font-medium text-muted hover:text-foreground transition-colors mb-8"
          >
            <Icon name="chevron-left" size={14} />
            {t("backToBlog")}
          </Link>

          {/* Header */}
          <header className="max-w-3xl mx-auto text-center mb-10">
            <div className="flex items-center justify-center gap-2 text-[11px] uppercase tracking-[2px] text-muted mb-4">
              <time dateTime={article.publishedAt}>
                {new Date(article.publishedAt).toLocaleDateString(
                  locale === "es" ? "es-MX" : "en-US",
                  { year: "numeric", month: "long", day: "numeric" }
                )}
              </time>
              {article.author.name && (
                <>
                  <span>·</span>
                  <span>
                    {t("by")} {article.author.name}
                  </span>
                </>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
              {article.title}
            </h1>
          </header>

          {/* Featured image */}
          {article.image && (
            <div className="relative aspect-[2/1] max-w-4xl mx-auto rounded-[24px] overflow-hidden mb-12">
              <Image
                src={article.image.url}
                alt={article.image.altText || article.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 900px"
                priority
              />
            </div>
          )}

          {/* Content */}
          <div
            className="prose prose-lg max-w-3xl mx-auto [&>p]:leading-relaxed [&>p]:text-foreground/80 [&>h2]:tracking-tight [&>h2]:font-bold [&>h3]:tracking-tight [&>img]:rounded-xl"
            dangerouslySetInnerHTML={{ __html: article.contentHtml }}
          />

          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-border flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-xs bg-foreground/5 rounded-full text-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
    </article>
  );
}
