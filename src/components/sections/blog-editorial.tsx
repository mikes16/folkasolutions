import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { Article } from "@/lib/commerce/types";
import { SectionHeading } from "./section-heading";

interface BlogEditorialProps {
  title: string;
  linkText: string;
  blogHandle: string;
  articles: Article[];
}

function formatDate(dateString: string, locale?: string): string {
  try {
    return new Intl.DateTimeFormat(locale ?? "en", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(dateString));
  } catch {
    return "";
  }
}

export function BlogEditorial({
  title,
  linkText,
  blogHandle,
  articles,
}: BlogEditorialProps) {
  if (articles.length === 0) return null;

  return (
    <section className="container-page py-20 md:py-28">
      <SectionHeading
        title={title}
        href={`/blogs/${blogHandle}`}
        linkText={linkText}
      />
      {/* Mobile: horizontal scroll showing ~1.2 items. Desktop (md+): 3-col grid. */}
      <div className="-mx-5 md:-mx-10 md:mx-0">
        <div className="flex md:grid md:grid-cols-3 gap-5 md:gap-10 overflow-x-auto md:overflow-visible snap-x snap-mandatory scroll-pl-5 md:scroll-pl-0 px-5 md:px-0 pb-2 md:pb-0 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
          {articles.slice(0, 3).map((article) => (
            <Link
              key={article.id}
              href={`/blogs/${blogHandle}/${article.handle}`}
              className="group flex flex-col flex-shrink-0 w-[78%] md:w-auto snap-start"
            >
              {article.image && (
                <div className="relative aspect-[4/3] md:aspect-[4/5] rounded-2xl overflow-hidden mb-5">
                  <Image
                    src={article.image.url}
                    alt={article.image.altText || article.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 768px) 85vw, 33vw"
                  />
                </div>
              )}
              {article.tags[0] && (
                <span className="text-[10px] uppercase tracking-[2px] font-medium text-muted mb-2 font-[family-name:var(--font-rajdhani)]">
                  {article.tags[0]}
                </span>
              )}
              <h3 className="text-lg md:text-xl font-semibold tracking-tight leading-snug group-hover:underline font-[family-name:var(--font-rajdhani)]">
                {article.title}
              </h3>
              <div className="flex items-center gap-3 text-muted text-xs mt-3">
                {article.author?.name && <span>{article.author.name}</span>}
                {article.publishedAt && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-muted" />
                    <time dateTime={article.publishedAt}>
                      {formatDate(article.publishedAt)}
                    </time>
                  </>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
