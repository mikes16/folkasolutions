/**
 * Optimize the 3 homepage testimonial videos with ffmpeg (web-friendly H.264,
 * faststart, mute since they autoplay) and upload to Cloudinary alongside
 * their poster frames. Run once when retiring the local /public/videos/
 * testimonials in favor of Cloudinary delivery.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/upload-testimonial-assets.ts
 */

export {};

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, statSync } from "node:fs";
import { basename, join } from "node:path";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ROOT = "/Users/insightcollective/Documents/Code/folka-nextjs";
const TMP = join(ROOT, ".optimized-media/reviews");
if (!existsSync(TMP)) mkdirSync(TMP, { recursive: true });

interface Job {
  src: string;
  out: string;
  publicId: string;
  resourceType: "video" | "image";
  encode: boolean;
}

const jobs: Job[] = [
  ...[1, 2, 3].flatMap((n) => [
    {
      src: join(ROOT, `public/videos/testimonial-${n}.mp4`),
      out: join(TMP, `testimonial-${n}.mp4`),
      publicId: `folka/reviews/testimonial-${n}`,
      resourceType: "video" as const,
      encode: true,
    },
    {
      src: join(ROOT, `public/videos/posters/testimonial-${n}.jpg`),
      out: join(ROOT, `public/videos/posters/testimonial-${n}.jpg`),
      publicId: `folka/reviews/posters/testimonial-${n}`,
      resourceType: "image" as const,
      encode: false,
    },
  ]),
];

function encode(src: string, out: string) {
  console.log(`  · encoding ${basename(src)}`);
  execFileSync(
    "ffmpeg",
    [
      "-y",
      "-i", src,
      "-c:v", "libx264",
      "-crf", "25",
      "-preset", "slow",
      "-pix_fmt", "yuv420p",
      "-movflags", "+faststart",
      "-an",
      out,
    ],
    { stdio: ["ignore", "ignore", "ignore"] },
  );
}

(async () => {
  for (const j of jobs) {
    if (!existsSync(j.src)) {
      console.log(`  ✗ skipping (missing): ${j.src}`);
      continue;
    }
    if (j.encode) encode(j.src, j.out);

    const sizeMb = (statSync(j.out).size / 1024 / 1024).toFixed(2);
    console.log(`  · ${j.resourceType.padEnd(5)} ${sizeMb.padStart(6)} MB · ${j.publicId}`);

    const result = (await new Promise<{ secure_url: string }>((resolve, reject) => {
      cloudinary.uploader.upload_large(
        j.out,
        {
          public_id: j.publicId,
          resource_type: j.resourceType,
          overwrite: true,
          use_filename: false,
          unique_filename: false,
          chunk_size: 6_000_000,
        },
        (err, result) => {
          if (err) reject(err);
          else resolve(result as { secure_url: string });
        },
      );
    }));
    console.log(`    ${result.secure_url}`);
  }
  console.log("\n✓ Done.");
})();
