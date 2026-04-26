import Image from "next/image";
import { cloudinaryUrl, cloudinaryVideoUrl } from "@/lib/cloudinary";
import {
  formatCafeLocation,
  type StoryCafe,
  type StoryCoverImage,
  type StoryVideo,
} from "@/lib/content/stories";

export interface StoryHeroProps {
  eyebrow: string;
  title: string;
  cafe: StoryCafe;
  coverImage: StoryCoverImage;
  /**
   * Optional main video. When omitted, the hero falls back to the cover
   * image (Aleta Azul case at launch).
   */
  mainVideo?: StoryVideo;
}

/**
 * Story detail hero. Cinematic full-bleed treatment with eyebrow / title /
 * café meta overlaid bottom-left. The aspect adapts to the source media:
 *
 * - 16:9 main video → ultra-wide cinematic frame.
 * - 9:16 main video → centered vertical column on desktop, full-bleed on
 *   mobile.
 * - No main video → cover image fills a wide editorial frame.
 *
 * The native video element is wrapped via a presentational `<video>` with
 * controls — the browser handles all the interaction, no client JS needed.
 */
export function StoryHero({
  eyebrow,
  title,
  cafe,
  coverImage,
  mainVideo,
}: StoryHeroProps) {
  const posterUrl = cloudinaryUrl(coverImage.url);
  const isVertical = mainVideo?.aspect === "9:16";

  // Outer frame aspect: vertical clips center on a max-width column to
  // avoid dominating widescreen viewports.
  const frameAspect = mainVideo
    ? isVertical
      ? "aspect-[9/16] max-w-[480px] mx-auto"
      : "aspect-video lg:aspect-[21/9]"
    : "aspect-[16/9] lg:aspect-[16/8]";

  return (
    <header className="relative w-full overflow-hidden">
      <div className={`relative w-full ${frameAspect}`}>
        {mainVideo ? (
          // The browser owns playback controls — no client wrapper needed.
          // `controls` reveals the native UI, `playsInline` keeps mobile
          // browsers from full-screening on tap.
          <video
            src={cloudinaryVideoUrl(mainVideo.publicId)}
            poster={posterUrl}
            controls
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="absolute inset-0 w-full h-full object-cover bg-foreground/5"
          />
        ) : (
          <Image
            src={posterUrl}
            alt={coverImage.alt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        )}

        {/* Editorial gradient — readability for the overlaid copy. We keep
            the gradient OFF the vertical layout so the centered video
            doesn't get a dimmed band on each side. */}
        {!isVertical && (
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/40 to-foreground/20 pointer-events-none"
          />
        )}

        {!isVertical && (
          <div className="absolute inset-x-0 bottom-0 pointer-events-none">
            <div className="container-page pb-12 md:pb-20 lg:pb-24">
              <div className="max-w-3xl">
                <p className="text-[11px] uppercase tracking-[4px] font-medium font-[family-name:var(--font-rajdhani)] text-background/85">
                  {eyebrow}
                </p>
                <h1
                  className="font-[family-name:var(--font-rajdhani)] tracking-tight leading-[1.02] text-background mt-5"
                  style={{
                    fontWeight: 300,
                    fontSize: "clamp(2.5rem, 5vw, 5rem)",
                  }}
                >
                  {title}
                </h1>
                <p className="text-[11px] uppercase tracking-[3px] font-[family-name:var(--font-rajdhani)] text-background/75 mt-4">
                  {cafe.name}
                  <span aria-hidden="true"> · </span>
                  {formatCafeLocation(cafe)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* For 9:16 layouts the title block lives BELOW the video, since
          overlaying it would crowd a portrait frame. */}
      {isVertical && (
        <div className="container-page py-12 md:py-16">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-[11px] uppercase tracking-[4px] font-medium font-[family-name:var(--font-rajdhani)] text-foreground/65">
              {eyebrow}
            </p>
            <h1
              className="font-[family-name:var(--font-rajdhani)] tracking-tight leading-[1.02] mt-5"
              style={{
                fontWeight: 300,
                fontSize: "clamp(2.5rem, 5vw, 5rem)",
              }}
            >
              {title}
            </h1>
            <p className="text-[11px] uppercase tracking-[3px] font-[family-name:var(--font-rajdhani)] text-foreground/65 mt-5">
              {cafe.name}
              <span aria-hidden="true"> · </span>
              {formatCafeLocation(cafe)}
            </p>
          </div>
        </div>
      )}
    </header>
  );
}
