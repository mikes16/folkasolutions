import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";

interface EmptyStateProps {
  eyebrow?: string;
  title: string;
  description?: string;
  ctaHref?: string;
  ctaText?: string;
  className?: string;
  children?: ReactNode;
}

// Shared editorial empty state — collection / cart / search / 404.
// Desert badge + Rajdhani headline + quiet body + single bordered CTA.
export function EmptyState({
  eyebrow,
  title,
  description,
  ctaHref,
  ctaText,
  className,
  children,
}: EmptyStateProps) {
  return (
    <div className={cn("text-center py-20 md:py-28", className)}>
      <DesertMark className="mx-auto mb-8" />
      {eyebrow && (
        <p className="text-[11px] uppercase tracking-[3px] font-medium text-muted mb-4 font-[family-name:var(--font-rajdhani)]">
          {eyebrow}
        </p>
      )}
      <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3 font-[family-name:var(--font-rajdhani)]">
        {title}
      </h2>
      {description && (
        <p className="text-muted max-w-md mx-auto leading-relaxed mb-8">
          {description}
        </p>
      )}
      {ctaHref && ctaText && (
        <Link
          href={ctaHref}
          className="inline-flex items-center gap-3 border border-foreground/15 rounded-full px-7 py-3 text-[11px] uppercase tracking-[3px] font-medium hover:border-foreground transition-colors duration-300"
        >
          {ctaText}
        </Link>
      )}
      {children}
    </div>
  );
}

// Minimal desert badge in line-art — circle horizon with a low sun.
// On-brand without requiring the full saguaro illustration asset.
function DesertMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      width="56"
      height="56"
      viewBox="0 0 56 56"
      fill="none"
      className={cn("text-foreground/35", className)}
    >
      <circle cx="28" cy="28" r="27" stroke="currentColor" strokeWidth="1" />
      <path
        d="M8 36 Q 18 32 28 34 T 48 34"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="28" cy="23" r="4.5" stroke="currentColor" strokeWidth="1" fill="none" />
      <g stroke="currentColor" strokeWidth="1" strokeLinecap="round">
        <path d="M28 13 L 28 15" />
        <path d="M38 23 L 36 23" />
        <path d="M20 23 L 18 23" />
        <path d="M21 16 L 22.5 17.5" />
        <path d="M35 16 L 33.5 17.5" />
      </g>
    </svg>
  );
}
