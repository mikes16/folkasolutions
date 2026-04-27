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
 * Story index card. The 9:16 teaser plays muted-on-intersection inside a
 * native-aspect frame; below it sits a clean editorial caption block with
 * eyebrow, café name, location, and a "Read story" arrow link.
 *
 * Why text-below instead of overlay: the source teasers carry burned-in
 * subtitles in the lower third. Overlaying the card identity in the same
 * zone collides visually. Letting the video keep its full frame and putting
 * the card's identity outside it reads as magazine layout (media object +
 * caption) and turns the burned-in subtitle from a bug into documentary
 * texture that teases the conversation.
 *
 * Editorial vocabulary: no rounded corners, no shadows, no gradient
 * overlays. The only motion is a subtle 700ms scale on the video and a
 * color/gap shift on the title/CTA when the card is hovered.
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
    <Link href={`/stories/${slug}`} className="group flex flex-col" aria-label={title}>
      {/* Video frame — native 9:16 aspect, no overlay, no gradient.
          Subtitles in the source remain visible as documentary texture. */}
      <div
        ref={containerRef}
        className="relative aspect-[9/16] overflow-hidden bg-foreground/5"
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
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
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
      </div>

      {/* Caption — outside the video frame, magazine-style.
          Eyebrow + café name + location + arrow link. */}
      <div className="pt-5">
        <p className="text-[10px] uppercase tracking-[3px] font-medium font-[family-name:var(--font-rajdhani)] text-foreground/55">
          {eyebrow}
        </p>
        <h3
          className="mt-2 text-2xl md:text-3xl tracking-tight leading-[1.05] font-[family-name:var(--font-rajdhani)] text-foreground transition-colors duration-300 group-hover:text-foreground/70"
          style={{ fontWeight: 300 }}
        >
          {cafe.name}
        </h3>
        <p className="mt-2 text-[11px] uppercase tracking-[2.5px] font-[family-name:var(--font-rajdhani)] text-foreground/55">
          {formatCafeLocation(cafe)}
        </p>
        <span className="inline-flex items-center gap-2 mt-4 text-[11px] uppercase tracking-[2.5px] font-medium font-[family-name:var(--font-rajdhani)] text-foreground transition-all duration-300 group-hover:gap-3">
          {readLabel}
          <span aria-hidden="true">&rarr;</span>
        </span>
      </div>

      {/* Off-screen description — present for screen readers, since the
          card title alone is a café name. */}
      <span className="sr-only">{description}</span>
    </Link>
  );
}
