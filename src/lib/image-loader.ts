import { cloudinaryUrl } from "./cloudinary";

type LoaderArgs = {
  src: string;
  width: number;
  quality?: number;
};

const CLOUDINARY_UPLOAD_RE = /^(https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(?:([^/]+)\/)?(.+)$/;

/**
 * Inject `w_${width},c_limit` and a quality flag into a fully-qualified
 * Cloudinary upload URL, replacing any prior transform segment. Lets
 * `<Image>` srcset trigger responsive variants instead of always pulling
 * the original asset (often 1080×1920+ for video posters).
 */
function applyCloudinaryTransforms(src: string, width: number, quality?: number): string | null {
  const match = src.match(CLOUDINARY_UPLOAD_RE);
  if (!match) return null;
  const [, base, existingTransforms, publicId] = match;
  const transforms = ["f_auto", `q_${quality || "auto"}`, `w_${width}`, "c_limit"];
  // If the second segment looks like a Cloudinary transform string (commas
  // or known prefixes) we drop it. Otherwise it was actually part of the
  // public ID and we keep it.
  const looksLikeTransform =
    existingTransforms !== undefined &&
    /^[a-z]_/i.test(existingTransforms) &&
    (existingTransforms.includes(",") || /^[a-z]_[^/]+$/i.test(existingTransforms));
  const restPath = looksLikeTransform ? publicId : `${existingTransforms ?? ""}${existingTransforms ? "/" : ""}${publicId}`;
  return `${base}${transforms.join(",")}/${restPath}`;
}

export default function imageLoader({ src, width, quality }: LoaderArgs): string {
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return applyCloudinaryTransforms(src, width, quality) ?? src;
  }

  if (
    src.startsWith("/hero/") ||
    src.startsWith("/backs/") ||
    src.startsWith("/banners/")
  ) {
    return cloudinaryUrl(src, ["f_auto", `q_${quality || "auto"}`, `w_${width}`, "c_limit"]);
  }

  return src;
}
