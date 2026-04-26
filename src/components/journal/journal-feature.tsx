import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/ui/icon";
import type { Locale } from "@/i18n/config";
import type { JournalSummary } from "@/lib/content/journal";
import { JournalCard } from "./journal-card";

export interface JournalFeatureProps {
  eyebrow: string;
  title: string;
  description: string;
  viewAllText: string;
  posts: JournalSummary[];
  locale: Locale;
  /** Localized short-form "MIN" / "MIN DE LECTURA" suffix used inside cards. */
  minReadLabel: string;
}

/**
 * Homepage Journal preview. Visual masthead is identical to
 * `<ProductCarousel>` so the section reads as the same vocabulary the rest
 * of the page already uses — only the body changes (editorial cards
 * instead of product cards).
 *
 * Renders nothing when no posts exist so the homepage doesn't ship an
 * empty masthead during the registry's bootstrap.
 */
export function JournalFeature({
  eyebrow,
  title,
  description,
  viewAllText,
  posts,
  locale,
  minReadLabel,
}: JournalFeatureProps) {
  if (posts.length === 0) return null;

  return (
    <section className="py-20 md:py-28 lg:py-32">
      <div className="container-page">
        <div className="grid md:grid-cols-12 gap-8 md:gap-12 mb-14 md:mb-20">
          <div className="md:col-span-8">
            <p className="text-[11px] uppercase tracking-[4px] font-medium font-[family-name:var(--font-rajdhani)] text-foreground/50 mb-6 md:mb-8">
              {eyebrow}
            </p>
            <h2
              className="text-4xl md:text-5xl lg:text-6xl tracking-tight font-[family-name:var(--font-rajdhani)] leading-[1.02] max-w-2xl"
              style={{ fontWeight: 300 }}
            >
              {title}
            </h2>
          </div>
          <div className="md:col-span-4 md:self-end flex flex-col gap-6">
            <p className="text-[15px] text-foreground/60 leading-relaxed max-w-sm">
              {description}
            </p>
            <Link
              href="/journal"
              className="inline-flex items-center gap-3 self-start text-[11px] uppercase tracking-[3px] font-semibold font-[family-name:var(--font-rajdhani)] text-foreground hover:gap-4 transition-all duration-300 cursor-pointer"
            >
              {viewAllText}
              <Icon name="arrow-right" size={14} />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
          {posts.map((post) => (
            <JournalCard
              key={post.slug}
              slug={post.slug}
              eyebrow={post.eyebrow}
              title={post.title}
              description={post.description}
              publishedAt={post.publishedAt}
              readingTimeMinutes={post.readingTimeMinutes}
              coverImage={post.coverImage}
              locale={locale}
              minReadLabel={minReadLabel}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
