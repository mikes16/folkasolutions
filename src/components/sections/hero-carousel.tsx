"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import NextImage from "next/image";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/ui/icon";
import type { HeroSlide } from "@/lib/hero-slides";
import posthog from "posthog-js";

interface HeroCarouselProps {
  slides: HeroSlide[];
  dragHint: string;
  prevLabel: string;
  nextLabel: string;
}

const AUTOPLAY_MS = 7000;

export function HeroCarousel({
  slides,
  prevLabel,
  nextLabel,
}: HeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const autoplayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const wheelAccum = useRef(0);
  const wheelTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartX = useRef(0);

  const textColor = "#101C2E";
  const textColorFaint = "rgba(16, 28, 46, 0.3)";

  const goTo = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(slides.length - 1, index));
      setActiveIndex(clamped);
    },
    [slides.length]
  );

  const next = useCallback(() => {
    setActiveIndex((i) => (i + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    setActiveIndex((i) => (i - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Autoplay — pauses on hover and when user manually navigates
  useEffect(() => {
    if (isPaused) return;

    autoplayRef.current = setTimeout(next, AUTOPLAY_MS);
    return () => {
      if (autoplayRef.current) clearTimeout(autoplayRef.current);
    };
  }, [activeIndex, isPaused, next]);

  // Keyboard nav
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
        setIsPaused(true);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
        setIsPaused(true);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [next, prev]);

  // Horizontal swipe / trackpad scroll
  const WHEEL_THRESHOLD = 50;
  const WHEEL_COOLDOWN = 900;
  const wheelCooldownUntil = useRef(0);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();

      // Cooldown prevents rapid-fire from trackpad momentum
      if (Date.now() < wheelCooldownUntil.current) return;

      wheelAccum.current += e.deltaX;

      if (wheelTimer.current) clearTimeout(wheelTimer.current);
      wheelTimer.current = setTimeout(() => {
        wheelAccum.current = 0;
      }, 150);

      if (wheelAccum.current > WHEEL_THRESHOLD) {
        wheelAccum.current = 0;
        wheelCooldownUntil.current = Date.now() + WHEEL_COOLDOWN;
        next();
        setIsPaused(true);
      } else if (wheelAccum.current < -WHEEL_THRESHOLD) {
        wheelAccum.current = 0;
        wheelCooldownUntil.current = Date.now() + WHEEL_COOLDOWN;
        prev();
        setIsPaused(true);
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [next, prev]);

  // Scroll parallax — sets CSS var consumed by layers at different factors
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let ticking = false;
    const update = () => {
      const rect = el.getBoundingClientRect();
      // Allow progress up to 1.8× section height so motion keeps accumulating
      // smoothly instead of clamping the moment the hero leaves the viewport.
      const progress = Math.max(0, Math.min(el.offsetHeight * 1.8, -rect.top));
      el.style.setProperty("--hero-scroll", `${progress}px`);
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
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Touch swipe (mobile)
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);
  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const deltaX = e.changedTouches[0].clientX - touchStartX.current;
      if (Math.abs(deltaX) > 50) {
        if (deltaX < 0) next();
        else prev();
        setIsPaused(true);
      }
    },
    [next, prev]
  );

  const handleManualNav = (action: () => void) => {
    setIsPaused(true);
    action();
  };

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-background"
      style={{ height: "calc(100svh - 106px)" }}
      aria-roledescription="carousel"
      aria-label="Featured products"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides — stacked, crossfade via opacity */}
      {slides.map((slide, i) => (
        <Slide
          key={slide.id}
          slide={slide}
          isActive={i === activeIndex}
          isPriority={i === 0}
        />
      ))}

      {/* Bottom bar — counter, progress, nav arrows */}
      <div className="absolute left-0 right-0 bottom-0 z-30 pointer-events-none">
        <div className="px-6 md:px-10 lg:px-16 xl:px-24 pb-5 lg:pb-6">
          <div className="flex items-center justify-between gap-6">
            {/* Counter */}
            <div
              className="text-[13px] tracking-[2px] font-medium font-[family-name:var(--font-rajdhani)] tabular-nums"
              style={{ color: textColor }}
            >
              <span className="opacity-40">(</span>
              <span className="mx-1">{activeIndex + 1}</span>
              <span className="opacity-40">/</span>
              <span className="mx-1 opacity-40">{slides.length}</span>
              <span className="opacity-40">)</span>
            </div>

            {/* Progress segments */}
            <div className="flex-1 flex items-center gap-2 max-w-xs pointer-events-auto">
              {slides.map((s, i) => {
                const isActive = i === activeIndex;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleManualNav(() => goTo(i))}
                    aria-label={`Go to slide ${i + 1}`}
                    className="group flex-1 py-3"
                  >
                    <span
                      className="block relative w-full transition-all duration-500"
                      style={{
                        backgroundColor: textColorFaint,
                        height: isActive ? "2px" : "1px",
                      }}
                    >
                      {isActive && (
                        <span
                          key={`fill-${activeIndex}`}
                          className="absolute inset-y-0 left-0 block"
                          style={{
                            backgroundColor: textColor,
                            width: "0%",
                            animation: isPaused
                              ? "none"
                              : `hero-progress-fill ${AUTOPLAY_MS}ms linear forwards`,
                          }}
                        />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Nav arrows */}
            <div className="flex items-center gap-3 pointer-events-auto">
              <button
                type="button"
                onClick={() => handleManualNav(prev)}
                aria-label={prevLabel}
                className="w-10 h-10 flex items-center justify-center rounded-full border transition-opacity duration-200 cursor-pointer"
                style={{ borderColor: textColorFaint, color: textColor }}
              >
                <Icon name="chevron-left" size={16} />
              </button>
              <button
                type="button"
                onClick={() => handleManualNav(next)}
                aria-label={nextLabel}
                className="w-10 h-10 flex items-center justify-center rounded-full border transition-opacity duration-200 cursor-pointer"
                style={{ borderColor: textColorFaint, color: textColor }}
              >
                <Icon name="chevron-right" size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Slide({
  slide,
  isActive,
  isPriority,
}: {
  slide: HeroSlide;
  isActive: boolean;
  isPriority: boolean;
}) {
  const textColor = "#101C2E";
  const mutedColor = "rgba(16, 28, 46, 0.55)";

  return (
    <div
      className="absolute inset-0 transition-opacity duration-700 ease-in-out"
      style={{ opacity: isActive ? 1 : 0, pointerEvents: isActive ? "auto" : "none" }}
      aria-hidden={!isActive}
      aria-roledescription="slide"
    >
      {/* Watermark — short commercial name as giant background text */}
      <span
        className="absolute left-0 right-0 top-0 flex items-start justify-center pointer-events-none select-none overflow-hidden z-0"
        aria-hidden="true"
        style={{
          transform: "translate3d(0, calc(var(--hero-scroll, 0px) * 0.55), 0)",
          willChange: "transform",
        }}
      >
        <span
          className="font-bold uppercase whitespace-nowrap font-[family-name:var(--font-rajdhani)] leading-[0.85] mt-[1vh] lg:mt-[3vh] transition-all duration-700"
          style={{
            color: textColor,
            opacity: isActive ? 0.06 : 0,
            fontSize: "clamp(6rem, 17vw, 16rem)",
            transform: isActive ? "translateY(0)" : "translateY(-20px)",
          }}
        >
          {slide.watermark}
        </span>
      </span>

      {/* Mobile layout — stacked: image top, text bottom */}
      <div
        className="lg:hidden absolute inset-0 flex flex-col"
        style={{
          opacity: isActive ? 1 : 0,
          transition: "opacity 600ms ease-in-out",
        }}
      >
        {/* Product image — top half */}
        {slide.imageUrl && (
          <div className="relative flex-1 pointer-events-none">
            <NextImage
              src={slide.imageUrl}
              alt={slide.imageAlt}
              fill
              className="object-contain object-center drop-shadow-2xl p-6"
              sizes="90vw"
              priority={isPriority}
              draggable={false}
            />
          </div>
        )}
        {/* Text — bottom */}
        <div className="px-6 pb-20 pt-2">
          <div className="flex flex-col gap-2">
            <h2
              className="text-[1.75rem] md:text-4xl font-semibold tracking-tight font-[family-name:var(--font-rajdhani)] leading-[1.05]"
              style={{ color: textColor }}
            >
              {slide.title}
            </h2>
            <p
              className="text-[13px] max-w-[280px] leading-relaxed"
              style={{ color: mutedColor }}
            >
              {slide.tagline}
            </p>
            <div className="mt-2">
              <Link
                href={slide.href}
                className="inline-flex items-center gap-3 border rounded-full px-6 py-3 text-[11px] uppercase tracking-[3px] font-semibold font-[family-name:var(--font-rajdhani)] transition-all duration-300 cursor-pointer hover:border-primary hover:gap-4"
                style={{ color: textColor, borderColor: "rgba(16, 28, 46, 0.3)" }}
                onClick={() => {
                  posthog.capture("hero_cta_clicked", {
                    slide_title: slide.title,
                    slide_href: slide.href,
                    cta_text: slide.ctaText,
                    layout: "mobile",
                  });
                }}
              >
                {slide.ctaText}
                <Icon name="chevron-right" size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop layout — absolute positioned elements */}
      {/* Main product image — centered */}
      {slide.imageUrl && (
        <div
          className="hidden lg:block absolute inset-0 pointer-events-none z-[1]"
          style={{
            transform: "translate3d(0, calc(var(--hero-scroll, 0px) * -0.22), 0)",
            willChange: "transform",
          }}
        >
          <div
            className="absolute w-[50%] xl:w-[45%] h-[80%]"
            style={{
              left: "50%",
              top: "50%",
              opacity: isActive ? 1 : 0,
              transform: isActive
                ? "translate(-50%, -45%)"
                : "translate(-50%, -42%) scale(0.97)",
              transition: "opacity 700ms ease-in-out 100ms, transform 700ms ease-in-out 100ms",
            }}
          >
            <NextImage
              src={slide.imageUrl}
              alt={slide.imageAlt}
              fill
              className="object-contain drop-shadow-2xl"
              sizes="45vw"
              priority={isPriority}
              draggable={false}
            />
          </div>
        </div>
      )}

      {/* Text content — left side (desktop) */}
      <div
        className="hidden lg:block absolute left-0 top-[35%] px-16 xl:px-24 z-[2]"
        style={{
          transform: "translate3d(0, calc(var(--hero-scroll, 0px) * -0.38), 0)",
          willChange: "transform",
        }}
      >
      <div
        style={{
          opacity: isActive ? 1 : 0,
          transform: isActive ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 600ms ease-in-out, transform 600ms ease-in-out",
        }}
      >
        <div className="flex flex-col gap-4 max-w-sm">
          <h2
            className="text-[2.75rem] xl:text-5xl font-semibold tracking-tight font-[family-name:var(--font-rajdhani)] leading-[1.05]"
            style={{ color: textColor }}
          >
            {slide.title}
          </h2>

          <p
            className="text-[15px] max-w-xs leading-relaxed"
            style={{ color: mutedColor }}
          >
            {slide.tagline}
          </p>

          <div className="mt-3">
            <Link
              href={slide.href}
              className="inline-flex items-center gap-3 border rounded-full px-6 py-3 text-[11px] uppercase tracking-[3px] font-semibold font-[family-name:var(--font-rajdhani)] transition-all duration-300 cursor-pointer hover:border-primary hover:gap-4"
              style={{ color: textColor, borderColor: "rgba(16, 28, 46, 0.3)" }}
              onClick={() => {
                posthog.capture("hero_cta_clicked", {
                  slide_title: slide.title,
                  slide_href: slide.href,
                  cta_text: slide.ctaText,
                  layout: "desktop",
                });
              }}
            >
              {slide.ctaText}
              <Icon name="chevron-right" size={14} />
            </Link>
          </div>
        </div>
      </div>
      </div>

      {/* Lifestyle slot — right side (desktop only). Renders video loop when
        * available, falls back to static image otherwise. */}
      {(slide.lifestyleVideoUrl || slide.lifestyleImageUrl) && (
        <div
          className="hidden lg:block absolute right-16 xl:right-24 top-[28%] z-[3] w-[200px] xl:w-[230px]"
          style={{
            transform: "translate3d(0, calc(var(--hero-scroll, 0px) * -0.28), 0)",
            willChange: "transform",
          }}
        >
          <div
            style={{
              opacity: isActive ? 1 : 0,
              transform: isActive ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 700ms ease-in-out 200ms, transform 700ms ease-in-out 200ms",
            }}
          >
            <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-[#101C2E]/5">
              {slide.lifestyleVideoUrl ? (
                <LifestyleVideo
                  src={slide.lifestyleVideoUrl}
                  poster={slide.lifestyleVideoPosterUrl ?? slide.lifestyleImageUrl ?? undefined}
                  isActive={isActive}
                  alt={`${slide.title} in context`}
                />
              ) : (
                <NextImage
                  src={slide.lifestyleImageUrl!}
                  alt={`${slide.title} in context`}
                  fill
                  className="object-cover"
                  sizes="230px"
                  draggable={false}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LifestyleVideo({
  src,
  poster,
  isActive,
  alt,
}: {
  src: string;
  poster: string | undefined;
  isActive: boolean;
  alt: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Pause inactive slides to save resources; play when active.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || reducedMotion) return;
    if (isActive) {
      video.play().catch(() => {
        // Autoplay blocked — poster stays visible, that's the graceful path.
      });
    } else {
      video.pause();
    }
  }, [isActive, reducedMotion]);

  if (reducedMotion) {
    return poster ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={poster}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />
    ) : null;
  }

  return (
    <video
      ref={videoRef}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="metadata"
      aria-label={alt}
      className="absolute inset-0 w-full h-full object-cover"
    />
  );
}
