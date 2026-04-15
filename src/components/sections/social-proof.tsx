import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/ui/icon";

interface Review {
  text: string;
  author: string;
}

interface SocialProofProps {
  reviews: Review[];
  commercialTitle: string;
  commercialText: string;
  ctaText: string;
  ctaHref: string;
  trustShipping: string;
  trustService: string;
  trustPayment: string;
}

export function SocialProof({
  reviews,
  commercialTitle,
  commercialText,
  ctaText,
  ctaHref,
  trustShipping,
  trustService,
  trustPayment,
}: SocialProofProps) {
  const [featured, ...rest] = reviews;

  return (
    <section className="bg-background py-20 md:py-28">
      <div className="container-page grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        {/* Left — Testimonials */}
        <div>
          {featured && (
            <div className="mb-10">
              <span className="text-8xl font-serif text-secondary leading-none select-none">
                &ldquo;
              </span>
              <p className="text-lg md:text-xl leading-relaxed text-foreground -mt-8 max-w-lg">
                {featured.text}
              </p>
              <p className="text-[11px] uppercase tracking-[3px] text-muted mt-4 font-[family-name:var(--font-rajdhani)]">
                {featured.author}
              </p>
            </div>
          )}

          {rest.length > 0 && (
            <>
              <div className="w-16 h-px bg-secondary mb-8" />
              <div className="flex flex-col gap-6">
                {rest.map((review) => (
                  <div key={review.author}>
                    <p className="text-sm text-foreground/70 leading-relaxed">
                      &ldquo;{review.text}&rdquo;
                    </p>
                    <p className="text-[11px] uppercase tracking-[2px] text-muted mt-2 font-[family-name:var(--font-rajdhani)]">
                      — {review.author}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right — Commercial CTA + Trust badges */}
        <div className="flex flex-col justify-center gap-8">
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight font-[family-name:var(--font-rajdhani)]">
            {commercialTitle}
          </h2>
          <p className="text-sm md:text-base text-muted leading-relaxed max-w-lg">
            {commercialText}
          </p>
          <Link
            href={ctaHref}
            className="inline-flex items-center gap-2.5 text-[11px] uppercase tracking-[3px] font-medium text-foreground border-b border-foreground/40 pb-1.5 hover:border-foreground transition-colors duration-300 self-start"
          >
            {ctaText} <Icon name="arrow-right" size={14} />
          </Link>

          {/* Trust badges */}
          <div className="flex flex-col gap-4 mt-4">
            {[trustShipping, trustService, trustPayment].map((badge) => (
              <div key={badge} className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />
                <span className="text-sm text-foreground/70">{badge}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
