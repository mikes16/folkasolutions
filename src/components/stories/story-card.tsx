"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { Link } from "@/i18n/navigation";
import { cloudinaryUrl, cloudinaryVideoUrl } from "@/lib/cloudinary";
import {
  formatCafeLocation,
  type StoryCafe,
  type StoryCoverImage,
  type StoryVideo,
} from "@/lib/content/stories";

/**
 * Subscribes to `prefers-reduced-motion` via React 18's
 * `useSyncExternalStore`. Avoids the setState-in-effect anti-pattern that
 * tripped ESLint while still tracking media-query changes at runtime.
 *
 * Server snapshot returns `false` (no preference assumed) so the initial
 * render matches the typical client; the real value updates after hydration.
 */
function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    (callback) => {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      mq.addEventListener("change", callback);
      return () => mq.removeEventListener("change", callback);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

export interface StoryCardProps {
  slug: string;
  eyebrow: string;
  title: string;
  description: string;
  cafe: StoryCafe;
  coverImage: StoryCoverImage;
  teaserVideo: StoryVideo;
  /** Localized "Read story" CTA label. */
  readLabel: string;
}

/**
 * Story index card. Vertical 4:5 portrait frame. Plays the 9:16 teaser
 * video muted-on-intersection, falls back to the static cover poster when
 * the user prefers reduced motion or the browser blocks playback.
 *
 * Editorial vocabulary: no rounded corners, no shadows. The only motion is
 * a subtle 700ms scale on the video as the card is hovered.
 */
export function StoryCard({
  slug,
  eyebrow,
  title,
  description,
  cafe,
  coverImage,
  teaserVideo,
  readLabel,
}: StoryCardProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const shouldAutoplay = !prefersReducedMotion;

  // Autoplay-on-intersection: play when ≥50% of the card is visible, pause
  // when it scrolls out. Skipped entirely under prefers-reduced-motion.
  useEffect(() => {
    if (!shouldAutoplay) return;
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          // Browsers may reject autoplay on some setups — swallow the rejection.
          void video.play().catch(() => undefined);
        } else {
          video.pause();
        }
      },
      { threshold: [0, 0.5, 1] },
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [shouldAutoplay]);

  const teaserSrc = cloudinaryVideoUrl(teaserVideo.publicId);
  const posterSrc = cloudinaryUrl(coverImage.url);

  return (
    <Link href={`/stories/${slug}`} className="group block" aria-label={title}>
      <div
        ref={containerRef}
        className="relative aspect-[4/5] overflow-hidden bg-foreground/5"
      >
        {shouldAutoplay ? (
          <video
            ref={videoRef}
            src={teaserSrc}
            poster={posterSrc}
            muted
            loop
            playsInline
            preload="none"
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
          />
        ) : (
          // Reduced-motion fallback: render the poster as a still image.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={posterSrc}
            alt={coverImage.alt}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Bottom gradient — keeps the overlaid copy legible against any frame. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/30 to-transparent"
        />

        <div className="absolute inset-x-0 bottom-0 p-6 md:p-7 flex flex-col">
          <p className="text-[10px] uppercase tracking-[3px] font-medium font-[family-name:var(--font-rajdhani)] text-background/85">
            {eyebrow}
          </p>
          <h3 className="text-2xl md:text-3xl font-medium tracking-tight font-[family-name:var(--font-rajdhani)] text-background mt-2 leading-[1.1]">
            {cafe.name}
          </h3>
          <p className="text-[11px] uppercase tracking-[2.5px] font-[family-name:var(--font-rajdhani)] text-background/70 mt-1">
            {formatCafeLocation(cafe)}
          </p>
          <span className="inline-flex items-center gap-2 mt-5 text-[11px] uppercase tracking-[3px] font-semibold font-[family-name:var(--font-rajdhani)] text-background/80 group-hover:text-background transition-colors duration-300">
            {readLabel}
            <span aria-hidden="true">&rarr;</span>
          </span>
        </div>
      </div>

      {/* Off-screen description — present for screen readers, since the
          card title alone is a café name. */}
      <span className="sr-only">{description}</span>
    </Link>
  );
}
