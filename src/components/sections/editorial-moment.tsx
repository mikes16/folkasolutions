"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/ui/icon";

interface EditorialMomentProps {
  eyebrow: string;
  title: string;
  description: string;
  ctaText: string;
  ctaHref: string;
  /** 16:9 video — autoplay muted on desktop */
  videoUrl?: string;
  /** Fallback or poster image */
  imageUrl?: string;
  imageAlt?: string;
}

export function EditorialMoment({
  eyebrow,
  title,
  description,
  ctaText,
  ctaHref,
  videoUrl,
  imageUrl,
  imageAlt = "",
}: EditorialMomentProps) {
  const sectionRef = useRef<HTMLElement>(null);

  // Parallax — background media drifts slower than scroll
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let ticking = false;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const viewportH = window.innerHeight;
      // Progress runs from when the section first enters the viewport to when
      // it has fully exited above it. Centered progress keeps motion symmetric.
      const travel = viewportH + rect.height;
      const raw = viewportH - rect.top;
      const progress = Math.max(0, Math.min(travel, raw));
      el.style.setProperty("--editorial-scroll", `${progress}px`);
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
    <section ref={sectionRef} className="relative w-full overflow-hidden bg-primary">
      {/* Media — video or image, full-bleed */}
      <div className="relative w-full aspect-[16/9] md:aspect-[21/9]">
        {/* Parallax wrapper — scaled so translation never reveals edges */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            transform:
              "translate3d(0, calc(var(--editorial-scroll, 0px) * -0.04), 0) scale(1.1)",
            willChange: "transform",
          }}
        >
          {videoUrl ? (
            <video
              autoPlay
              muted
              loop
              playsInline
              poster={imageUrl}
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src={videoUrl} type="video/mp4" />
            </video>
          ) : imageUrl ? (
            <Image
              src={imageUrl}
              alt={imageAlt}
              fill
              sizes="100vw"
              className="object-cover"
              priority={false}
            />
          ) : (
            <div className="absolute inset-0 bg-primary" />
          )}
        </div>

        {/* Midnight Blue overlay for text readability */}
        <div className="absolute inset-0 bg-primary/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/60 via-primary/20 to-transparent" />

        {/* Content overlay */}
        <div className="absolute inset-0 flex items-center">
          <div className="container-page">
            <div className="max-w-xl">
              <p className="text-[11px] uppercase tracking-[4px] font-medium text-white/60 mb-4 font-[family-name:var(--font-rajdhani)]">
                {eyebrow}
              </p>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 font-[family-name:var(--font-rajdhani)]">
                {title}
              </h2>
              <p className="text-base md:text-lg text-white/70 leading-relaxed mb-8 max-w-md">
                {description}
              </p>
              <Link
                href={ctaHref}
                className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[3px] font-medium text-white border border-white/40 rounded-full px-7 py-3.5 hover:bg-white hover:text-primary transition-all duration-300"
              >
                {ctaText} <Icon name="arrow-right" size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
