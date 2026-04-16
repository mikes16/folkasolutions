import Image from "next/image";
import { Link } from "@/i18n/navigation";

interface Category {
  label: string;
  href: string;
  imageUrl?: string;
}

interface CategoryNavigationProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  categories: Category[];
}

/**
 * Category Navigation — invite-to-click grid.
 *
 * Editorial aesthetic preserved (line-art icons, generous whitespace) but the
 * CTAs are now unambiguous:
 *   - Large section heading replaces the whisper-eyebrow.
 *   - Optional subtitle gives users a reason to click.
 *   - Circles use a visible border + hover ring, not just a tint.
 *   - Chevron under each label animates on hover — a universal "go here" cue.
 */
export function CategoryNavigation({
  eyebrow,
  title,
  description,
  categories,
}: CategoryNavigationProps) {
  return (
    <section className="border-t border-border bg-gradient-to-b from-transparent via-[color:var(--folka-mineral-sand)]/5 to-transparent py-16 md:py-20 lg:py-24">
      <div className="container-page">
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          {eyebrow && (
            <p className="text-[11px] uppercase tracking-[3px] font-medium text-muted mb-4 font-[family-name:var(--font-rajdhani)]">
              {eyebrow}
            </p>
          )}
          {title && (
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight font-[family-name:var(--font-rajdhani)] mb-4">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-muted leading-relaxed">{description}</p>
          )}
        </div>

        <div className="grid grid-cols-3 lg:grid-cols-6 gap-y-10 gap-x-4 md:gap-6 lg:gap-8">
          {categories.map((category) => (
            <Link
              key={category.href}
              href={category.href}
              className="group flex flex-col items-center gap-4"
            >
              <div className="relative w-[120px] h-[120px] md:w-[160px] md:h-[160px] lg:w-[180px] lg:h-[180px] rounded-full border border-foreground/15 flex items-center justify-center bg-background transition-all duration-500 group-hover:border-foreground/40 group-hover:shadow-[0_0_0_6px_rgba(16,28,46,0.04)] group-hover:-translate-y-1">
                <div className="relative w-16 h-16 md:w-24 md:h-24 lg:w-28 lg:h-28">
                  {category.imageUrl ? (
                    <Image
                      src={category.imageUrl}
                      alt={category.label}
                      fill
                      sizes="(max-width: 768px) 64px, (max-width: 1024px) 96px, 112px"
                      className="object-contain transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-accent/20" />
                  )}
                </div>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <span className="text-[12px] md:text-[14px] uppercase tracking-[2px] font-semibold text-foreground font-[family-name:var(--font-rajdhani)] transition-colors duration-300 group-hover:text-foreground">
                  {category.label}
                </span>
                {/* Arrow chevron — static opacity 40%, slides right + fully opaque on hover. */}
                <span
                  aria-hidden="true"
                  className="text-[11px] text-foreground/40 transition-all duration-300 group-hover:text-foreground group-hover:translate-x-1"
                >
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
