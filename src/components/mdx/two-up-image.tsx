import Image from "next/image";

export interface TwoUpImageEntry {
  src: string;
  alt: string;
}

export interface TwoUpImageProps {
  left: TwoUpImageEntry;
  right: TwoUpImageEntry;
  caption?: string;
}

/**
 * Side-by-side image pair with optional caption. Editorial spacing —
 * generous outer margins and a tight inner gutter so the pair reads as a
 * single composition. Images use `next/image` so the project's custom
 * Cloudinary loader handles `/hero/*` and `/backs/*` paths automatically.
 */
export function TwoUpImage({ left, right, caption }: TwoUpImageProps) {
  return (
    <figure className="my-10 md:my-14">
      <div className="grid grid-cols-2 gap-3 md:gap-5">
        <div className="relative aspect-[4/5] overflow-hidden bg-foreground/5">
          <Image
            src={left.src}
            alt={left.alt}
            fill
            sizes="(max-width: 768px) 50vw, 400px"
            className="object-cover"
          />
        </div>
        <div className="relative aspect-[4/5] overflow-hidden bg-foreground/5">
          <Image
            src={right.src}
            alt={right.alt}
            fill
            sizes="(max-width: 768px) 50vw, 400px"
            className="object-cover"
          />
        </div>
      </div>
      {caption && (
        <figcaption className="text-sm italic text-foreground/55 mt-3 text-center">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
