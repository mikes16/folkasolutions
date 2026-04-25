"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/ui/icon";

interface ClosingCtaProps {
  eyebrow: string;
  title: string;
  description: string;
  ctaText: string;
  ctaHref: string;
  /** Optional cinematic background image. Adds texture to the closing moment
   *  so the sequence Newsletter → ClosingCta → Footer doesn't read as three
   *  flat colored slabs. */
  imageUrl?: string;
  imageAlt?: string;
}

export function ClosingCta({
  eyebrow,
  title,
  description,
  ctaText,
  ctaHref,
  imageUrl,
  imageAlt = "",
}: ClosingCtaProps) {
  const sectionRef = useRef<HTMLElement>(null);

  // Parallax — background drifts slower than scroll when an image is present.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || !imageUrl) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let ticking = false;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const travel = viewportH + rect.height;
      const raw = viewportH - rect.top;
      const progress = Math.max(0, Math.min(travel, raw));
      el.style.setProperty("--closing-scroll", `${progress}px`);
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
  }, [imageUrl]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-primary py-28 md:py-40"
    >
      {imageUrl && (
        <>
          {/* Parallax image wrapper — scaled so drift never reveals edges */}
          <div
            className="absolute inset-0"
            style={{
              transform:
                "translate3d(0, calc(var(--closing-scroll, 0px) * -0.04), 0) scale(1.1)",
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
          {/* Midnight Blue overlay — keeps copy readable, preserves depth */}
          <div className="absolute inset-0 bg-primary/80" />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/40 via-primary/10 to-primary/60" />
        </>
      )}

      {/* Subtle decorative accent line */}
      <div
        className="absolute inset-x-0 top-0 h-px z-10"
        style={{
          background:
            "linear-gradient(to right, transparent, rgba(242, 237, 227, 0.18), transparent)",
        }}
      />

      <div className="relative z-10 container-page max-w-3xl mx-auto text-center">
        <p className="text-[11px] uppercase tracking-[4px] font-medium text-primary-foreground/50 mb-6 font-[family-name:var(--font-rajdhani)]">
          {eyebrow}
        </p>
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-primary-foreground mb-6 font-[family-name:var(--font-rajdhani)]">
          {title}
        </h2>
        <p className="text-base md:text-lg text-primary-foreground/70 leading-relaxed mb-10 max-w-lg mx-auto">
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
