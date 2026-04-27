/**
 * Re-encode every video in public/hero/ to a normalized MP4 (H.264, no audio).
 * Hero loops render at ~230px wide on desktop and ~90vw on mobile, with 4:5
 * portrait sources at 460x576. Empirically H.264 beats VP9 and AV1 at this
 * resolution — the WebM advantage only shows up at 720p+ — so we ship MP4
 * only and rely on a single <video src=...> tag.
 *
 * Output goes to .optimized-media/hero/. Pass --apply to copy back into
 * public/hero/, replacing the originals.
 *
 * Usage:
 *   npx tsx scripts/optimize-hero-videos.ts          # encode only (dry run)
 *   npx tsx scripts/optimize-hero-videos.ts --apply  # encode + replace originals
 */

export {};

import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { basename, extname, join } from "node:path";

const ROOT = "/Users/insightcollective/Documents/Code/folka-nextjs";
const SRC_DIR = join(ROOT, "public/hero");
const OUT_DIR = join(ROOT, ".optimized-media/hero");

const MP4_CRF = 28;
const MAX_WIDTH = 480;

interface Result {
  name: string;
  originalBytes: number;
  newBytes: number;
}

function ensureDir(dir: string) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function encodeMp4(src: string, out: string) {
  const args = [
    "-y",
    "-i",
    src,
    "-c:v",
    "libx264",
    "-crf",
    String(MP4_CRF),
    "-preset",
    "slow",
    "-profile:v",
    "main",
    "-pix_fmt",
    "yuv420p",
    "-vf",
    `scale='min(${MAX_WIDTH},iw)':-2`,
    "-movflags",
    "+faststart",
    "-an",
    out,
  ];
  execFileSync("ffmpeg", args, { stdio: ["ignore", "ignore", "ignore"] });
}

function fmtKb(bytes: number): string {
  return `${(bytes / 1024).toFixed(0)} KB`;
}

function fmtPct(newBytes: number, oldBytes: number): string {
  const pct = ((newBytes - oldBytes) / oldBytes) * 100;
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(0)}%`;
}

function run() {
  const apply = process.argv.includes("--apply");

  ensureDir(OUT_DIR);

  const sources = readdirSync(SRC_DIR)
    .filter((name) => extname(name).toLowerCase() === ".mp4")
    .map((name) => join(SRC_DIR, name));

  if (sources.length === 0) {
    console.log("No .mp4 files in public/hero/. Nothing to do.");
    return;
  }

  console.log(`Found ${sources.length} hero videos. Encoding to optimized MP4...\n`);

  const results: Result[] = [];

  for (const src of sources) {
    const stem = basename(src, extname(src));
    const out = join(OUT_DIR, `${stem}.mp4`);

    const start = Date.now();
    process.stdout.write(`  · ${stem}.mp4 ... `);
    encodeMp4(src, out);
    const seconds = ((Date.now() - start) / 1000).toFixed(1);
    process.stdout.write(`${seconds}s\n`);

    results.push({
      name: stem,
      originalBytes: statSync(src).size,
      newBytes: statSync(out).size,
    });
  }

  console.log("\nResults:\n");
  console.log(
    `  ${"file".padEnd(34)} ${"original".padStart(10)}  ${"new".padStart(10)}  ${"delta".padStart(8)}`,
  );
  console.log(`  ${"-".repeat(68)}`);

  let totalOrig = 0;
  let totalNew = 0;

  for (const r of results) {
    totalOrig += r.originalBytes;
    totalNew += r.newBytes;
    console.log(
      `  ${r.name.padEnd(34)} ${fmtKb(r.originalBytes).padStart(10)}  ${fmtKb(r.newBytes).padStart(10)}  ${fmtPct(r.newBytes, r.originalBytes).padStart(8)}`,
    );
  }

  console.log(`  ${"-".repeat(68)}`);
  console.log(
    `  ${"TOTAL".padEnd(34)} ${fmtKb(totalOrig).padStart(10)}  ${fmtKb(totalNew).padStart(10)}  ${fmtPct(totalNew, totalOrig).padStart(8)}`,
  );
  console.log(`\n  Saved: ${fmtKb(totalOrig - totalNew)}`);

  if (apply) {
    console.log(`\nApplying to public/hero/ ...`);
    for (const r of results) {
      const out = join(OUT_DIR, `${r.name}.mp4`);
      const dst = join(SRC_DIR, `${r.name}.mp4`);
      copyFileSync(out, dst);
      console.log(`  · ${r.name}.mp4`);
    }
    console.log(`\n✓ Applied. ${results.length} files replaced.`);
  } else {
    console.log(`\n(Dry run — files written to .optimized-media/hero/. Run again with --apply to replace originals.)`);
  }
}

run();
