export {};

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const SOURCE =
  "/Users/insightcollective/Documents/Code/folka-nextjs/public/login-hero/login_image.png";
const PUBLIC_ID = "folka/account/login-hero";

(async () => {
  console.log(`→ uploading ${SOURCE} as ${PUBLIC_ID}`);

  // format: "webp" tells Cloudinary to convert the source to WebP at upload
  // time, so the master asset stored on Cloudinary is already optimized.
  // Reads from the URL still get f_auto behavior, but the source-of-truth
  // is WebP rather than the 6.9 MB PNG.
  const result = (await cloudinary.uploader.upload_large(SOURCE, {
    public_id: PUBLIC_ID,
    resource_type: "image",
    format: "webp",
    overwrite: true,
    use_filename: false,
    unique_filename: false,
    chunk_size: 6_000_000,
  })) as { secure_url: string; bytes: number; format: string };

  console.log(
    `   ✓ ${result.secure_url} (${(result.bytes / 1024).toFixed(0)} KB, ${result.format})`,
  );
  console.log("\nDone.");
})();
