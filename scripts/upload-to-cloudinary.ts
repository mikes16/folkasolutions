import { readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { v2 as cloudinary } from "cloudinary";
import { CLOUDINARY_FOLDER } from "../src/lib/cloudinary";

const ROOT = join(process.cwd(), "public");
const FOLDERS = ["hero", "backs"];

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) out.push(...walk(full));
    else if (/\.(webp|jpe?g|png|avif)$/i.test(entry)) out.push(full);
  }
  return out;
}

async function main() {
  const files = FOLDERS.flatMap((f) => walk(join(ROOT, f)));
  const manifest: Record<string, string> = {};

  for (const file of files) {
    const publicPath = "/" + relative(ROOT, file).replace(/\\/g, "/");
    const publicId = `${CLOUDINARY_FOLDER}${publicPath.replace(/\.[^.]+$/, "")}`;
    console.log(`→ uploading ${publicPath} as ${publicId}`);

    const result = await cloudinary.uploader.upload(file, {
      public_id: publicId,
      overwrite: true,
      resource_type: "image",
      use_filename: false,
      unique_filename: false,
    });

    manifest[publicPath] = result.secure_url;
  }

  const manifestPath = join(process.cwd(), "cloudinary-manifest.json");
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`\n✓ uploaded ${files.length} images`);
  console.log(`✓ manifest written to ${relative(process.cwd(), manifestPath)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
