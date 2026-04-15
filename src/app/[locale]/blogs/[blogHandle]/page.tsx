import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { commerce } from "@/lib/commerce";
import { localeCountryMap, type Locale } from "@/i18n/config";

export const revalidate = 120;

interface Props {
  params: Promise<{ blogHandle: string; locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { blogHandle, locale } = await params;
  const { country, language } = localeCountryMap[locale as Locale] ?? localeCountryMap.es;
  const blog = await commerce.getBlog(blogHandle, { country, language });
  if (!blog) return {};
  return { title: blog.title };
}

export default async function BlogPage({ params }: Props) {
  const { blogHandle, locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("blog");
  const { country, language } = localeCountryMap[locale as Locale] ?? localeCountryMap.es;

  const blog = await commerce.getBlog(blogHandle, { first: 50, country, language });
  if (!blog) notFound();

  return (
    <div className="container-page py-12">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-10">
            {blog.title}
          </h1>

          {blog.articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blog.articles.map((article) => (
                <Link
                  key={article.id}
                  href={`/blogs/${blogHandle}/${article.handle}`}
                  className="group flex flex-col"
                >
                  {/* Image */}
                  <div className="relative aspect-[16/10] bg-white rounded-[24px] overflow-hidden mb-4">
                    {article.image ? (
                      <Image
                        src={article.image.url}
                        alt={article.image.altText || article.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted text-sm bg-border/20">
                        {blog.title}
                      </div>
                    )}
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-[2px] text-muted mb-2">
                    <time dateTime={article.publishedAt}>
                      {new Date(article.publishedAt).toLocaleDateString(
                        locale === "es" ? "es-MX" : "en-US",
                        { year: "numeric", month: "long", day: "numeric" }
                      )}
                    </time>
                    {article.author.name && (
                      <>
                        <span>·</span>
                        <span>{article.author.name}</span>
                      </>
                    )}
                  </div>

                  {/* Title */}
                  <h2 className="text-lg font-bold tracking-tight group-hover:underline mb-2">
                    {article.title}
                  </h2>

                  {/* Excerpt */}
                  {article.excerpt && (
                    <p className="text-sm text-muted line-clamp-3 leading-relaxed">
                      {article.excerpt}
                    </p>
                  )}

                  <span className="text-xs uppercase tracking-[2px] font-medium mt-3 border-b border-foreground self-start pb-0.5 group-hover:opacity-70 transition-opacity">
                    {t("readMore")}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-muted py-20 text-center">{t("noPosts")}</p>
          )}
    </div>
  );
}
