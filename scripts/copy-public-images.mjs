import { mkdir, writeFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

// Resizes the curated backup photos into public/images. media/webp is gitignored,
// so CI runs this with no sources present and reuses the committed output.
const ROOT = process.cwd();
const SRC_ROOT = join(ROOT, "media", "webp");
const OUT = join(ROOT, "public", "images");
const map = JSON.parse(readFileSync(join(ROOT, "content", "image-map.json"), "utf8"));

let sharp;
try {
  ({ default: sharp } = await import("sharp"));
} catch {
  sharp = null;
}

await mkdir(OUT, { recursive: true });

const jobs = [
  ...map.assets.map((a) => ({ ...a, variants: [a.w] })),
  ...map.gallery.map((a) => ({ ...a, variants: [a.w] })),
  ...map.services.map((s) => ({
    key: `svc-${s.slug}`,
    src: s.src,
    alt: s.alt,
    variants: [1440, 720],
  })),
];

let written = 0;
let skipped = 0;

for (const job of jobs) {
  const from = join(SRC_ROOT, job.src);
  for (const [i, width] of job.variants.entries()) {
    const name = i === 0 ? `${job.key}.webp` : `${job.key}-sm.webp`;
    const to = join(OUT, name);
    if (!sharp || !existsSync(from)) {
      if (!existsSync(to)) console.warn("missing", job.src, "->", name);
      skipped += 1;
      continue;
    }
    await sharp(from)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 78 })
      .toFile(to);
    written += 1;
  }
}

await writeFile(join(OUT, ".nojekyll"), "");
console.log("images written", written, "reused", skipped);
