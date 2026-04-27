/**
 * Upload optimized hero videos from public/hero/ to Cloudinary, overwriting
 * existing public IDs at folka/hero/{stem}, and update cloudinary-manifest.json
 * with the new secure URLs. Files are already optimized — this script does NOT
 * re-encode, it just uploads.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/upload-hero-videos.ts
 */

export {};

import { v2 as cloudinary } from "cloudinary";
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { basename, extname, join } from "node:path";

const ROOT = "/Users/insightcollective/Documents/Code/folka-nextjs";
const SRC_DIR = join(ROOT, "public/hero");
const MANIFEST = join(ROOT, "cloudinary-manifest.json");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface UploadResult {
  secure_url: string;
  bytes: number;
}

function uploadVideo(file: string, publicId: string): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_large(
      file,
      {
        public_id: publicId,
        resource_type: "video",
        overwrite: true,
        invalidate: true,
        use_filename: false,
        unique_filename: false,
        chunk_size: 6_000_000,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result as UploadResult);
      },
    );
  });
}

async function run() {
  const manifest: Record<string, string> = JSON.parse(readFileSync(MANIFEST, "utf8"));

  const videos = readdirSync(SRC_DIR)
    .filter((name) => extname(name).toLowerCase() === ".mp4")
    .map((name) => join(SRC_DIR, name));

  if (videos.length === 0) {
    console.log("No .mp4 in public/hero/. Nothing to upload.");
    return;
  }

  console.log(`Uploading ${videos.length} hero videos to Cloudinary...\n`);

  for (const file of videos) {
    const stem = basename(file, extname(file));
    const publicId = `folka/hero/${stem}`;
    const sizeKb = (statSync(file).size / 1024).toFixed(0);
    console.log(`  · ${publicId} (${sizeKb} KB)`);
    const result = await uploadVideo(file, publicId);
    manifest[publicId] = result.secure_url;
    console.log(`    ${result.secure_url}`);
  }

  writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`\n✓ Uploaded ${videos.length} videos. Manifest updated.`);
}

run().catch((err) => {
  console.error("FAILED:", err);
  process.exit(1);
});
