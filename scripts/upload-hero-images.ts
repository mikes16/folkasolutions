/**
 * Upload every .webp in public/hero/ to Cloudinary at folka/hero/{stem},
 * overwriting existing entries, and update cloudinary-manifest.json. Cloudinary
 * applies f_auto/q_auto on delivery via image-loader.ts, so we upload the
 * source as-is and let the CDN do format negotiation per request.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/upload-hero-images.ts
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

function uploadImage(file: string, publicId: string): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      file,
      {
        public_id: publicId,
        resource_type: "image",
        overwrite: true,
        invalidate: true,
        use_filename: false,
        unique_filename: false,
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

  const images = readdirSync(SRC_DIR)
    .filter((name) => extname(name).toLowerCase() === ".webp")
    .map((name) => join(SRC_DIR, name));

  if (images.length === 0) {
    console.log("No .webp in public/hero/. Nothing to upload.");
    return;
  }

  console.log(`Uploading ${images.length} hero images to Cloudinary...\n`);

  for (const file of images) {
    const stem = basename(file, extname(file));
    const publicId = `folka/hero/${stem}`;
    const sizeKb = (statSync(file).size / 1024).toFixed(0);
    console.log(`  · ${publicId} (${sizeKb} KB)`);
    const result = await uploadImage(file, publicId);
    manifest[publicId] = result.secure_url;
    console.log(`    ${result.secure_url}`);
  }

  writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`\n✓ Uploaded ${images.length} images. Manifest updated.`);
}

run().catch((err) => {
  console.error("FAILED:", err);
  process.exit(1);
});
