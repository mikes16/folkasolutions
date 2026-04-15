"use client";

import NextImage from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { Image as ImageType } from "@/lib/commerce/types";
import { cn } from "@/lib/utils/cn";

interface ProductGalleryProps {
  images: ImageType[];
  title: string;
}

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const t = useTranslations();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const prevImagesRef = useRef(images);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prevImagesRef.current === images) return;
    prevImagesRef.current = images;
    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setSelectedIndex(0);
      scrollCarouselTo(0);
      setIsTransitioning(false);
    }, 150);
    return () => clearTimeout(timer);
  }, [images]);

  const scrollCarouselTo = useCallback((index: number) => {
    if (!carouselRef.current) return;
    const child = carouselRef.current.children[index] as HTMLElement | undefined;
    child?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
  }, []);

  function handleSelect(i: number) {
    if (i === selectedIndex) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedIndex(i);
      setIsTransitioning(false);
    }, 120);
  }

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;

    let timeout: ReturnType<typeof setTimeout>;
    function handleScroll() {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (!el) return;
        const scrollLeft = el.scrollLeft;
        const childWidth = el.children[0]?.clientWidth ?? 1;
        const snappedIndex = Math.round(scrollLeft / childWidth);
        if (snappedIndex !== selectedIndex && snappedIndex >= 0 && snappedIndex < images.length) {
          setSelectedIndex(snappedIndex);
        }
      }, 80);
    }

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", handleScroll);
      clearTimeout(timeout);
    };
  }, [images.length, selectedIndex]);

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-white rounded-[24px] flex items-center justify-center text-muted">
        {t("common.noImage")}
      </div>
    );
  }

  const safeIndex = Math.min(selectedIndex, images.length - 1);
  const selectedImage = images[safeIndex];

  return (
    <div className="relative flex flex-col gap-4">
      <ShareButton title={title} />

      {/* Desktop: thumbnail rail + main image */}
      <div className="hidden md:flex gap-4">
        {/* Vertical thumbnail rail */}
        {images.length > 1 && (
          <div className="flex flex-col gap-2 max-h-[600px] overflow-y-auto scrollbar-hide">
            {images.map((img, i) => (
              <button
                key={img.url}
                onClick={() => handleSelect(i)}
                aria-current={i === safeIndex ? "true" : undefined}
                aria-label={t("a11y.selectImage", { index: i + 1, total: images.length })}
                className={cn(
                  "relative w-16 h-16 lg:w-20 lg:h-20 shrink-0 rounded-xl overflow-hidden bg-white border-2 transition-all",
                  i === safeIndex
                    ? "border-foreground ring-1 ring-foreground/20"
                    : "border-transparent hover:border-border"
                )}
              >
                <NextImage
                  src={img.url}
                  alt={img.altText || `${title} ${i + 1}`}
                  fill
                  className="object-contain p-1.5"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        )}

        {/* Main image */}
        <div className="relative flex-1 aspect-square bg-white rounded-[24px] overflow-hidden">
          <NextImage
            src={selectedImage.url}
            alt={selectedImage.altText || title}
            fill
            className={cn(
              "object-contain p-8 transition-opacity duration-200",
              isTransitioning ? "opacity-0" : "opacity-100"
            )}
            sizes="(max-width: 1024px) 45vw, 40vw"
            priority
          />
        </div>
      </div>

      {/* Mobile: swipeable carousel */}
      <div className="md:hidden">
        <div
          ref={carouselRef}
          className="flex snap-x snap-mandatory overflow-x-auto scrollbar-hide -mx-5 px-5 gap-3"
        >
          {images.map((img, i) => (
            <div
              key={img.url}
              className="relative snap-start shrink-0 w-[85vw] aspect-square bg-white rounded-2xl overflow-hidden"
            >
              <NextImage
                src={img.url}
                alt={img.altText || `${title} ${i + 1}`}
                fill
                className="object-contain p-4"
                sizes="85vw"
                priority={i === 0}
              />
            </div>
          ))}
        </div>

        {/* Dot indicators */}
        {images.length > 1 && (
          <div className="flex justify-center gap-0.5 mt-4">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setSelectedIndex(i);
                  scrollCarouselTo(i);
                }}
                aria-label={t("a11y.selectImage", { index: i + 1, total: images.length })}
                className="p-1.5"
              >
                <span
                  className={cn(
                    "block rounded-full transition-all",
                    i === safeIndex
                      ? "w-6 h-2 bg-foreground"
                      : "w-2 h-2 bg-foreground/20"
                  )}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ShareButton({ title }: { title: string }) {
  const t = useTranslations("product");
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const shareData = { title, url: window.location.href };

    if (navigator.share) {
      try { await navigator.share(shareData); } catch { /* user cancelled */ }
      return;
    }

    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label={t("share")}
      className="absolute top-3 right-3 md:top-4 md:right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm border border-border/50 text-muted hover:text-foreground hover:bg-white transition-all shadow-sm"
    >
      {copied ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
      )}
    </button>
  );
}
