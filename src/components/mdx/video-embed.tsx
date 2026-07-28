import { cloudinaryVideoUrl, cloudinaryUrl } from "@/lib/cloudinary";

export interface VideoEmbedProps {
  /** Cloudinary publicId, e.g. "folka/journal/expert-tools-1". */
  publicId: string;
  aspect?: "16:9" | "9:16" | "4:5";
  autoplay?: boolean;
  controls?: boolean;
  /** Cloudinary publicId for a poster image (passed through `cloudinaryUrl`). */
  poster?: string;
  caption?: string;
}

/**
 * Frame and max-width per supported aspect. Landscape fills the article
 * column; portrait ratios are capped so vertical clips don't dominate the
 * desktop layout, with 4:5 allowed a little more room than 9:16 because it
 * is the shorter of the two.
 */
const ASPECT_CLASSES: Record<
  NonNullable<VideoEmbedProps["aspect"]>,
  { frame: string; width: string }
> = {
  "16:9": { frame: "aspect-video", width: "w-full" },
  "9:16": { frame: "aspect-[9/16]", width: "max-w-[460px] mx-auto" },
  "4:5": { frame: "aspect-[4/5]", width: "max-w-[540px] mx-auto" },
};

/**
 * Cloudinary-backed editorial video. Defaults to user-controlled playback
 * (no autoplay) so videos don't start unprompted in the middle of an article.
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
  const { frame, width } = ASPECT_CLASSES[aspect];

  return (
    <figure className={`my-10 md:my-12 ${width}`}>
      <div className={`relative w-full ${frame} bg-foreground/5`}>
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
