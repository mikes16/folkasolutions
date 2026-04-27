"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/ui/icon";

interface CommercialStat {
  /** Specific, non-rounded figure — reads as premium when concrete. */
  value: string;
  /** Supporting label (single line). */
  label: string;
}

interface CommercialCtaProps {
  eyebrow: string;
  title: string;
  description: string;
  ctaText: string;
  ctaHref: string;
  imageUrl?: string;
  imageAlt?: string;
  stats?: CommercialStat[];
}

export function CommercialCta({
  eyebrow,
  title,
  description,
  ctaText,
  ctaHref,
  imageUrl,
  imageAlt = "",
  stats,
}: CommercialCtaProps) {
  const sectionRef = useRef<HTMLElement>(null);

  // Parallax — subtle background drift on scroll
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let ticking = false;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const travel = viewportH + rect.height;
      const raw = viewportH - rect.top;
      const progress = Math.max(0, Math.min(travel, raw));
      el.style.setProperty("--commercial-scroll", `${progress}px`);
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-primary py-20 md:py-28">
      {imageUrl && (
        <>
          <div
            className="absolute inset-0"
            style={{
              transform:
                "translate3d(0, calc(var(--commercial-scroll, 0px) * -0.04), 0) scale(1.1)",
              willChange: "transform",
            }}
          >
            <Image
              src={imageUrl}
              alt={imageAlt}
              fill
              sizes="100vw"
              className="object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-primary/75" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/60 via-primary/20 to-transparent" />
        </>
      )}
      <div className="relative z-10 container-page grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* Left — text content */}
        <div>
          <p className="text-[11px] uppercase tracking-[4px] font-medium text-primary-foreground/40 mb-5 font-[family-name:var(--font-rajdhani)]">
            {eyebrow}
          </p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-primary-foreground mb-6 font-[family-name:var(--font-rajdhani)]">
            {title}
          </h2>
          <p className="text-base md:text-lg text-primary-foreground/60 leading-relaxed max-w-lg mb-10">
            {description}
          </p>
          <Link
            href={ctaHref}
            className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[3px] font-medium text-primary-foreground border border-primary-foreground/40 rounded-full px-7 py-3.5 hover:bg-primary-foreground hover:text-primary transition-all duration-300"
          >
            {ctaText} <Icon name="arrow-right" size={14} />
          </Link>
        </div>

        {/* Right — specific facts, not rounded marketing numbers */}
        {stats && stats.length > 0 && (
          <div className="flex flex-col gap-6 lg:items-end lg:text-right">
            <div className="flex flex-col gap-7 md:gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="flex flex-col lg:items-end gap-1.5">
                  <span className="text-3xl md:text-4xl lg:text-5xl font-semibold text-primary-foreground tracking-tight font-[family-name:var(--font-rajdhani)] tabular-nums">
                    {stat.value}
                  </span>
                  <span className="text-[11px] uppercase tracking-[2px] text-primary-foreground/50 font-[family-name:var(--font-rajdhani)] max-w-[18ch]">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
