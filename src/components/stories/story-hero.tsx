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
 * Story detail hero. The treatment adapts to the source media:
 *
 * - 16:9 main video → ultra-wide cinematic frame with bottom-left overlay.
 * - 9:16 main video → split 50/50 layout. Video fills the left column at
 *   full container height; eyebrow / title / café meta sit vertically
 *   centered in the right column on a Desert White surface. Mobile stacks
 *   vertically (video on top, copy below).
 * - No main video → cover image fills a wide editorial frame.
 *
 * The native `<video>` element handles playback in the browser — no client
 * wrapper is needed.
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

  // 9:16 takes a dedicated split layout. The remaining cases share the
  // wide cinematic frame with overlaid copy.
  if (isVertical && mainVideo) {
    return (
      <header className="relative w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:min-h-[640px] lg:h-[calc(100vh-100px)]">
          {/* Left column — video. On mobile this keeps the intrinsic 9:16
              aspect (tall portrait, expected for vertical content). On
              desktop it fills the column height via object-cover. */}
          <div className="relative w-full aspect-[9/16] lg:aspect-auto lg:h-full bg-foreground/5">
            <video
              src={cloudinaryVideoUrl(mainVideo.publicId)}
              poster={posterUrl}
              controls
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>

          {/* Right column — editorial copy on Desert White. */}
          <div className="flex items-center justify-start bg-background px-6 py-14 md:px-10 md:py-16 lg:px-16 xl:px-20">
            <div className="w-full max-w-xl">
              <p className="text-[11px] uppercase tracking-[4px] font-medium font-[family-name:var(--font-rajdhani)] text-foreground/75">
                {eyebrow}
              </p>
              <h1
                className="font-[family-name:var(--font-rajdhani)] tracking-tight leading-[1.02] text-foreground mt-6"
                style={{
                  fontWeight: 300,
                  fontSize: "clamp(2.5rem, 5vw, 5rem)",
                }}
              >
                {title}
              </h1>
              <p className="text-[11px] uppercase tracking-[3px] font-[family-name:var(--font-rajdhani)] text-foreground/75 mt-6">
                {cafe.name}
                <span aria-hidden="true"> · </span>
                {formatCafeLocation(cafe)}
              </p>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // 16:9 video and cover-image fallback share the cinematic overlay frame.
  const frameAspect = mainVideo
    ? "aspect-video lg:aspect-[21/9]"
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

        {/* Editorial gradient — readability for the overlaid copy. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/40 to-foreground/20 pointer-events-none"
        />

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
      </div>
    </header>
  );
}
