import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/ui/icon";

interface ClosingCtaProps {
  eyebrow: string;
  title: string;
  description: string;
  ctaText: string;
  ctaHref: string;
}

export function ClosingCta({
  eyebrow,
  title,
  description,
  ctaText,
  ctaHref,
}: ClosingCtaProps) {
  return (
    <section className="relative overflow-hidden bg-primary py-24 md:py-36">
      {/* Subtle decorative accent line */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent, rgba(242, 237, 227, 0.18), transparent)",
        }}
      />
      <div className="container-page max-w-3xl mx-auto text-center">
        <p className="text-[11px] uppercase tracking-[4px] font-medium text-primary-foreground/40 mb-6 font-[family-name:var(--font-rajdhani)]">
          {eyebrow}
        </p>
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-primary-foreground mb-6 font-[family-name:var(--font-rajdhani)]">
          {title}
        </h2>
        <p className="text-base md:text-lg text-primary-foreground/60 leading-relaxed mb-10 max-w-lg mx-auto">
          {description}
        </p>
        <Link
          href={ctaHref}
          className="inline-flex items-center gap-3 bg-primary-foreground text-primary rounded-full px-8 py-4 text-[11px] uppercase tracking-[3px] font-medium hover:opacity-90 transition-opacity duration-300"
        >
          {ctaText} <Icon name="arrow-right" size={14} />
        </Link>
      </div>
    </section>
  );
}
