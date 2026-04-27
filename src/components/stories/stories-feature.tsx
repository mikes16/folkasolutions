import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/ui/icon";
import type { StorySummary } from "@/lib/content/stories";
import { StoryCard } from "./story-card";

export interface StoriesFeatureProps {
  eyebrow: string;
  title: string;
  description: string;
  viewAllText: string;
  /** Localized "Read story" label forwarded to each StoryCard. */
  readLabel: string;
  /** Up to 3 stories to surface. */
  stories: StorySummary[];
}

/**
 * Homepage Stories preview. Surfaces the most recent café spotlights as a
 * 3-up magazine spread. Visual masthead matches `<ProductCarousel>` and
 * `<JournalFeature>` so the section reads as the same vocabulary the rest
 * of the page already uses; only the body changes (StoryCards with
 * autoplay-on-intersection teasers).
 *
 * Server component. The autoplay logic lives inside `<StoryCard>` (a client
 * component) so this stays a pure layout shell.
 *
 * Renders nothing when no stories exist so the homepage doesn't ship an
 * empty masthead during the registry's bootstrap.
 */
export function StoriesFeature({
  eyebrow,
  title,
  description,
  viewAllText,
  readLabel,
  stories,
}: StoriesFeatureProps) {
  if (stories.length === 0) return null;

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
              href="/stories"
              className="inline-flex items-center gap-3 self-start text-[11px] uppercase tracking-[3px] font-semibold font-[family-name:var(--font-rajdhani)] text-foreground hover:gap-4 transition-all duration-300 cursor-pointer"
            >
              {viewAllText}
              <Icon name="arrow-right" size={14} />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
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
      </div>
    </section>
  );
}
