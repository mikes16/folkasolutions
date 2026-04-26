export const CLOUDINARY_CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "insightcollective";

export const CLOUDINARY_BASE_URL = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload`;
export const CLOUDINARY_VIDEO_BASE_URL = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload`;

export const CLOUDINARY_FOLDER = "folka";

export function cloudinaryUrl(
  publicPath: string,
  transforms: string[] = ["f_auto", "q_auto"],
): string {
  const publicId = `${CLOUDINARY_FOLDER}${publicPath}`.replace(/\.[^.]+$/, "");
  return `${CLOUDINARY_BASE_URL}/${transforms.join(",")}/${publicId}`;
}

/**
 * Build a Cloudinary video URL. Accepts a fully-qualified `publicId`
 * (e.g. `folka/journal/expert-tools-1`) — does NOT auto-prepend the
 * folder, since editorial videos may live outside the default `folka/`
 * namespace.
 */
export function cloudinaryVideoUrl(
  publicId: string,
  transforms: string[] = ["f_auto", "q_auto"],
): string {
  const id = publicId.replace(/\.[^.]+$/, "");
  return `${CLOUDINARY_VIDEO_BASE_URL}/${transforms.join(",")}/${id}`;
}
