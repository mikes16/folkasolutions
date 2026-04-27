/**
 * Web-optimize all hero/banner/stories media via ffmpeg, generate posters
 * for stories, and upload everything to Cloudinary under the `folka/`
 * namespace. Outputs a manifest with the resulting secure URLs.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/optimize-and-upload.ts
 */

export {};

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { basename, extname, join } from "node:path";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ROOT = "/Users/insightcollective/Documents/Code/folka-nextjs";
const OPTIMIZED_DIR = join(ROOT, ".optimized-media");

const IMAGE_EXTS = new Set([".webp", ".jpg", ".jpeg", ".png", ".avif"]);
const VIDEO_EXTS = new Set([".mp4", ".mov", ".webm", ".m4v"]);

interface VideoTask {
  src: string;
  out: string;
  publicId: string;
  audio: boolean;
  crf: number;
}

interface ImageTask {
  src: string;
  publicId: string;
}

interface PosterTask {
  src: string;
  out: string;
  publicId: string;
  /** Seek seconds into the video for the poster frame. */
  seek: number;
}

function listFiles(dir: string, allowedExts: Set<string>): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => allowedExts.has(extname(name).toLowerCase()))
    .map((name) => join(dir, name));
}

function ensureDir(dir: string) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function encode(task: VideoTask) {
  ensureDir(join(OPTIMIZED_DIR, "tmp"));
  const audioArgs = task.audio ? ["-c:a", "aac", "-b:a", "128k"] : ["-an"];
  const args = [
    "-y",
    "-i",
    task.src,
    "-c:v",
    "libx264",
    "-crf",
    String(task.crf),
    "-preset",
    "slow",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    ...audioArgs,
    task.out,
  ];
  console.log(`  · encoding ${basename(task.src)} -> ${basename(task.out)}`);
  execFileSync("ffmpeg", args, { stdio: ["ignore", "ignore", "ignore"] });
}

function extractPoster(task: PosterTask) {
  const args = [
    "-y",
    "-ss",
    String(task.seek),
    "-i",
    task.src,
    "-frames:v",
    "1",
    "-q:v",
    "2",
    task.out,
  ];
  console.log(`  · poster ${basename(task.out)} from ${basename(task.src)} @ ${task.seek}s`);
  execFileSync("ffmpeg", args, { stdio: ["ignore", "ignore", "ignore"] });
}

async function uploadImage(file: string, publicId: string) {
  const result = (await cloudinary.uploader.upload(file, {
    public_id: publicId,
    resource_type: "image",
    overwrite: true,
    use_filename: false,
    unique_filename: false,
  })) as { secure_url: string; bytes: number };
  return result;
}

async function uploadVideo(file: string, publicId: string) {
  const result = (await new Promise<{ secure_url: string; bytes: number }>((resolve, reject) => {
    cloudinary.uploader.upload_large(
      file,
      {
        public_id: publicId,
        resource_type: "video",
        overwrite: true,
        use_filename: false,
        unique_filename: false,
        chunk_size: 6_000_000,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result as { secure_url: string; bytes: number });
      },
    );
  }));
  return result;
}

const manifest: Record<string, string> = {};

async function run() {
  ensureDir(OPTIMIZED_DIR);

  // -------- Image tasks --------
  const imageTasks: ImageTask[] = [];

  for (const file of listFiles(join(ROOT, "public/hero"), IMAGE_EXTS)) {
    imageTasks.push({ src: file, publicId: `folka/hero/${basename(file, extname(file))}` });
  }
  for (const file of listFiles(join(ROOT, "public/banners"), IMAGE_EXTS)) {
    imageTasks.push({ src: file, publicId: `folka/banners/${basename(file, extname(file))}` });
  }

  // -------- Video tasks --------
  const heroVideosOut = join(OPTIMIZED_DIR, "hero");
  const storiesVideosOut = join(OPTIMIZED_DIR, "stories");
  const storiesPostersOut = join(OPTIMIZED_DIR, "stories/posters");
  ensureDir(heroVideosOut);
  ensureDir(storiesVideosOut);
  ensureDir(storiesPostersOut);

  const videoTasks: VideoTask[] = [];

  for (const file of listFiles(join(ROOT, "public/hero"), VIDEO_EXTS)) {
    const stem = basename(file, extname(file));
    videoTasks.push({
      src: file,
      out: join(heroVideosOut, `${stem}.mp4`),
      publicId: `folka/hero/${stem}`,
      audio: false,
      crf: 26,
    });
  }

  for (const file of listFiles(join(ROOT, "public/videos/stories"), VIDEO_EXTS)) {
    const stem = basename(file, extname(file));
    const isMain = stem.endsWith("-main");
    videoTasks.push({
      src: file,
      out: join(storiesVideosOut, `${stem}.mp4`),
      publicId: `folka/stories/${stem}`,
      audio: isMain,
      crf: isMain ? 23 : 25,
    });
  }

  // -------- Poster tasks (one per café, derived from main if available else teaser) --------
  const cafeStems = new Set<string>();
  for (const v of videoTasks) {
    if (v.publicId.startsWith("folka/stories/")) {
      const m = v.publicId.match(/^folka\/stories\/(folka-x-[^-]+(?:-[^-]+)*?)(?:-main|-teaser)$/);
      if (m) cafeStems.add(m[1]);
    }
  }

  const posterTasks: PosterTask[] = [];
  for (const cafe of cafeStems) {
    // Prefer main video for poster; fall back to teaser if main doesn't exist.
    const mainTask = videoTasks.find((t) => t.publicId === `folka/stories/${cafe}-main`);
    const teaserTask = videoTasks.find((t) => t.publicId === `folka/stories/${cafe}-teaser`);
    const sourceTask = mainTask ?? teaserTask;
    if (!sourceTask) continue;
    posterTasks.push({
      src: sourceTask.src,
      out: join(storiesPostersOut, `${cafe}.jpg`),
      publicId: `folka/stories/posters/${cafe}`,
      seek: 3,
    });
  }

  // -------- Encode pass --------
  console.log(`\n=== Encoding ${videoTasks.length} videos ===`);
  for (const t of videoTasks) encode(t);

  console.log(`\n=== Extracting ${posterTasks.length} posters ===`);
  for (const t of posterTasks) extractPoster(t);

  // -------- Upload pass --------
  console.log(`\n=== Uploading ${imageTasks.length} images ===`);
  for (const t of imageTasks) {
    const sizeMb = (statSync(t.src).size / 1024 / 1024).toFixed(2);
    console.log(`  · image  ${sizeMb.padStart(6)} MB · ${t.publicId}`);
    try {
      const r = await uploadImage(t.src, t.publicId);
      console.log(`    ${r.secure_url}`);
      manifest[t.publicId] = r.secure_url;
    } catch (err) {
      console.error(`    FAILED:`, (err as { message?: string })?.message ?? err);
    }
  }

  console.log(`\n=== Uploading ${videoTasks.length} videos ===`);
  for (const t of videoTasks) {
    const sizeMb = (statSync(t.out).size / 1024 / 1024).toFixed(2);
    console.log(`  · video  ${sizeMb.padStart(6)} MB · ${t.publicId}`);
    try {
      const r = await uploadVideo(t.out, t.publicId);
      console.log(`    ${r.secure_url}`);
      manifest[t.publicId] = r.secure_url;
    } catch (err) {
      console.error(`    FAILED:`, (err as { message?: string })?.message ?? err);
    }
  }

  console.log(`\n=== Uploading ${posterTasks.length} posters ===`);
  for (const t of posterTasks) {
    const sizeKb = (statSync(t.out).size / 1024).toFixed(0);
    console.log(`  · poster ${sizeKb.padStart(4)} KB · ${t.publicId}`);
    try {
      const r = await uploadImage(t.out, t.publicId);
      console.log(`    ${r.secure_url}`);
      manifest[t.publicId] = r.secure_url;
    } catch (err) {
      console.error(`    FAILED:`, (err as { message?: string })?.message ?? err);
    }
  }

  // -------- Manifest --------
  const manifestPath = join(ROOT, "cloudinary-manifest.json");
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`\n✓ ${Object.keys(manifest).length} assets uploaded.`);
  console.log(`✓ Manifest: ${manifestPath}`);
}

run().catch((err) => {
  console.error("FAILED:", err);
  process.exit(1);
});
