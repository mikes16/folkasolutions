import type { ReactNode } from "react";

export interface PullQuoteProps {
  attribution?: string;
  /** Show/hide the opening Mineral Sand quote glyph. Default: true. */
  showGlyph?: boolean;
  children: ReactNode;
}

/**
 * Magazine-style pull-quote. Visual treatment matches the Reviews section
 * (`src/components/sections/reviews.tsx`) so quotes embedded in articles
 * read as the same vocabulary the site already uses for testimonials.
 */
export function PullQuote({
  attribution,
  showGlyph = true,
  children,
}: PullQuoteProps) {
  return (
    <figure className="my-12 md:my-16">
      {showGlyph && (
        <span
          aria-hidden="true"
          className="block font-[family-name:var(--font-rajdhani)] select-none -ml-1"
          style={{
            color: "var(--folka-mineral-sand)",
            fontSize: "clamp(5rem, 10vw, 9rem)",
            lineHeight: 0.55,
            fontWeight: 300,
            opacity: 0.85,
          }}
        >
          &ldquo;
        </span>
      )}
      <blockquote
        className="text-2xl md:text-3xl lg:text-[2.25rem] font-[300] leading-[1.25] tracking-tight font-[family-name:var(--font-rajdhani)] text-foreground -mt-3 md:-mt-5 relative z-10"
      >
        {children}
      </blockquote>
      {attribution && (
        <figcaption className="flex flex-col mt-8 md:mt-10">
          <span
            aria-hidden="true"
            className="block h-px w-10 bg-foreground/25 mb-5"
          />
          <p className="text-[11px] uppercase tracking-[2.5px] text-foreground/60 font-[family-name:var(--font-rajdhani)] font-medium">
            {attribution}
          </p>
        </figcaption>
      )}
    </figure>
  );
}
