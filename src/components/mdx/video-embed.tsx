import { cloudinaryVideoUrl, cloudinaryUrl } from "@/lib/cloudinary";

export interface VideoEmbedProps {
  /** Cloudinary publicId, e.g. "folka/journal/expert-tools-1". */
  publicId: string;
  aspect?: "16:9" | "9:16";
  autoplay?: boolean;
  controls?: boolean;
  /** Cloudinary publicId for a poster image (passed through `cloudinaryUrl`). */
  poster?: string;
  caption?: string;
}

/**
 * Cloudinary-backed editorial video. Defaults to user-controlled playback
 * (no autoplay) so videos don't start unprompted in the middle of an article.
 *
 * - 16:9 fills the article column.
 * - 9:16 caps at 460px so vertical clips don't dominate desktop layouts.
 */
export function VideoEmbed({
  publicId,
  aspect = "16:9",
  autoplay = false,
  controls = true,
  poster,
  caption,
}: VideoEmbedProps) {
  const src = cloudinaryVideoUrl(publicId);
  const posterUrl = poster ? cloudinaryUrl(poster) : undefined;
  const aspectClass = aspect === "9:16" ? "aspect-[9/16]" : "aspect-video";
  const widthClass =
    aspect === "9:16" ? "max-w-[460px] mx-auto" : "w-full";

  return (
    <figure className={`my-10 md:my-12 ${widthClass}`}>
      <div className={`relative w-full ${aspectClass} bg-foreground/5`}>
        <video
          src={src}
          poster={posterUrl}
          {...(autoplay
            ? { autoPlay: true, loop: true, muted: true, playsInline: true }
            : {})}
          controls={controls}
          preload={autoplay ? "metadata" : "none"}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
      {caption && (
        <figcaption className="text-sm italic text-foreground/55 mt-3 text-center">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
