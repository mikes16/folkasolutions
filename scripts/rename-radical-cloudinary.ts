export {};

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

(async () => {
  const renames: { from: string; to: string; resourceType: "video" | "image" }[] = [
    {
      from: "folka/stories/folka-x-radica-main",
      to: "folka/stories/folka-x-radical-main",
      resourceType: "video",
    },
    {
      from: "folka/stories/folka-x-radica-teaser",
      to: "folka/stories/folka-x-radical-teaser",
      resourceType: "video",
    },
    {
      from: "folka/stories/posters/folka-x-radica",
      to: "folka/stories/posters/folka-x-radical",
      resourceType: "image",
    },
  ];

  for (const r of renames) {
    try {
      const result = (await cloudinary.uploader.rename(r.from, r.to, {
        resource_type: r.resourceType,
        overwrite: false,
      })) as { secure_url: string };
      console.log(`✓ ${r.from} → ${r.to}`);
      console.log(`  ${result.secure_url}`);
    } catch (err) {
      console.error(`✗ ${r.from} → ${r.to}:`, (err as { message?: string })?.message ?? err);
    }
  }
})();
