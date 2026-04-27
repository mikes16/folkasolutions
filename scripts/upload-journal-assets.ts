export {};

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ROOT = "/Users/insightcollective/Documents/Code/folka-nextjs/public/videos/journal";

interface UploadTask {
  file: string;
  publicId: string;
  resourceType: "video" | "image";
}

const tasks: UploadTask[] = [
  { file: `${ROOT}/expert-1-link.mp4`, publicId: "folka/journal/expert-link-roberta", resourceType: "video" },
  { file: `${ROOT}/expert-1-xbloom.mp4`, publicId: "folka/journal/expert-xbloom-avenamar", resourceType: "video" },
  { file: `${ROOT}/posters/expert-link.jpg`, publicId: "folka/journal/posters/expert-link-roberta", resourceType: "image" },
  { file: `${ROOT}/posters/expert-xbloom.jpg`, publicId: "folka/journal/posters/expert-xbloom-avenamar", resourceType: "image" },
];

(async () => {
  for (const t of tasks) {
    console.log(`→ uploading ${t.file} as ${t.publicId} (${t.resourceType})`);
    const result = (await cloudinary.uploader.upload_large(t.file, {
      public_id: t.publicId,
      resource_type: t.resourceType,
      overwrite: true,
      use_filename: false,
      unique_filename: false,
      chunk_size: 6_000_000,
    })) as { secure_url: string; bytes: number };
    console.log(`   ✓ ${result.secure_url} (${result.bytes} bytes)`);
  }
  console.log("\nDone.");
})();