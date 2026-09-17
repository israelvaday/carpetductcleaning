import { mkdir, writeFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

// Resizes the curated backup photos into public/images. media/webp is gitignored,
// so CI runs this with no sources present and reuses the committed output.
//
// Every photo is written under a key derived from its source filename via
// srcToKey() (shared with lib/images.ts). Services additionally get a -sm card
// variant. The manifest (content/image-map.json) references photos by src; the
// runtime resolves src -> key -> /images/{key}.webp.
const ROOT = process.cwd();
const SRC_WEBP = join(ROOT, "media", "webp");
const SRC_GEN = join(ROOT, "media", "generated");
const OUT = join(ROOT, "public", "images");
const map = JSON.parse(readFileSync(join(ROOT, "content", "image-map.json"), "utf8"));

let sharp;
try {
  ({ default: sharp } = await import("sharp"));
} catch {
  sharp = null;
}

// Must stay in sync with lib/images.ts srcToKey.
function srcToKey(src) {
  return src
    .replace(/\.(jpg|jpeg|png|gif)\.webp$/i, "")
    .replace(/\.(webp|png|jpe?g|gif|avif)$/i, "")
    .split("/")
    .pop()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

await mkdir(OUT, { recursive: true });

// Collect every unique photo the site references, with the widths to emit.
// key -> { src, widths: number[] }
const jobs = new Map();
function add(src, width) {
  if (!src) return;
  const key = srcToKey(src);
  const job = jobs.get(key) || { src, widths: new Set() };
  job.widths.add(width);
  jobs.set(key, job);
}

for (const a of map.assets || []) add(a.src, a.w || 1200);
for (const g of map.gallery || []) add(g.src, g.w || 800);
for (const s of map.services || []) {
  if (s.hero) add(s.hero, 1440); // hub hero
  for (const role of ["card", "picker"]) {
    if (s[role]) {
      add(s[role], 720); // full-size fallback -> {key}.webp
      add(s[role], 480); // card variant -> {key}-sm.webp
    }
  }
  for (const src of s.steps || []) add(src, 1200); // process wizard panels
}
for (const src of Object.values(map.cityExact || {})) add(src, 1600);
for (const entry of Object.values(map.cityLandmarks || {})) {
  add(entry.src, 720);
  add(entry.src, 480); // -sm card variant
}
for (const srcs of Object.values(map.cityJobs || {})) for (const src of srcs) add(src, 800);
for (const src of Object.values(map.posts || {})) add(src, 1200);

let written = 0;
let skipped = 0;

for (const [key, job] of jobs) {
  // generated/ srcs live in media/generated; everything else is in media/webp.
  const from = job.src.startsWith("generated/")
    ? join(SRC_GEN, job.src.replace(/^generated\//, ""))
    : join(SRC_WEBP, job.src);
  const widths = [...job.widths].sort((a, b) => b - a); // largest first
  for (const [i, width] of widths.entries()) {
    const name = i === 0 ? `${key}.webp` : `${key}-sm.webp`;
    const to = join(OUT, name);
    if (!sharp || !existsSync(from)) {
      if (!existsSync(to)) console.warn("missing", job.src, "->", name);
      skipped += 1;
      continue;
    }
    let ok = false;
    for (let attempt = 0; attempt < 4 && !ok; attempt++) {
      try {
        const buf = await sharp(from)
          .resize({ width, withoutEnlargement: true })
          .webp({ quality: 78 })
          .toBuffer();
        await writeFile(to, buf);
        ok = true;
      } catch {
        await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
      }
    }
    if (ok) written += 1;
    else {
      console.warn("failed", job.src, "->", name);
      skipped += 1;
    }
  }
}

await writeFile(join(OUT, ".nojekyll"), "");
console.log("photos:", jobs.size, "files written:", written, "reused/skipped:", skipped);
