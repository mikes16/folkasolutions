export {};

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

(async () => {
  console.log("Uploading 114 MB xBloom video to Cloudinary…");
  try {
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_large(
        "/Users/insightcollective/Documents/Code/folka-nextjs/public/videos/journal/expert-1-xbloom-compressed.mp4",
        {
          public_id: "folka/journal/expert-xbloom-avenamar",
          resource_type: "video",
          overwrite: true,
          use_filename: false,
          unique_filename: false,
          chunk_size: 6_000_000,
          timeout: 300_000,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    });
    console.log("✓ secure_url:", result?.secure_url);
    console.log("✓ bytes:", result?.bytes);
    console.log("✓ duration:", result?.duration);
    console.log("✓ public_id:", result?.public_id);
  } catch (err) {
    console.error("UPLOAD FAILED:", err);
    process.exit(1);
  }
})();