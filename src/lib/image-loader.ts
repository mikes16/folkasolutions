import { cloudinaryUrl } from "./cloudinary";

type LoaderArgs = {
  src: string;
  width: number;
  quality?: number;
};

export default function imageLoader({ src, width, quality }: LoaderArgs): string {
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return src;
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
