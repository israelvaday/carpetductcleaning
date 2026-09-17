/**
 * Vision-tag every unique original photo in media/webp into content/photo-tags.json.
 *
 * Usage:
 *   node scripts/tag-photos.mjs            # full run (skips already-tagged)
 *   node scripts/tag-photos.mjs --test 5   # tag 5 images and print, no write
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { getKey, loadEnvLocal, visionJson, pool, sleep } from "./or-lib.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MEDIA = join(ROOT, "media/webp");
const OUT = join(ROOT, "content/photo-tags.json");
const VISION_MODEL = process.env.OPENROUTER_VISION_MODEL || "google/gemini-2.5-flash-lite";
const CONCURRENCY = 8;

// WordPress size variants look like name-150x150.jpg.webp; the original drops the -WxH part.
function isOriginal(name) {
  return !/-\d{2,4}x\d{2,4}\./.test(name);
}

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

const PROMPT = `You are tagging photos for a carpet, air-duct, upholstery, rug, and hard-floor cleaning company in Orange County, CA. Look at this image and return strict JSON:
{
  "ok": true|false,                // false if blank, logo-only, screenshot, map, or pure graphic with no photo content
  "kind": "work"|"equipment"|"result"|"team"|"vehicle"|"graphic"|"other",
  "services": ["carpet-cleaning","air-duct-cleaning","dryer-vent-cleaning","upholstery-cleaning","couch-cleaning","area-rug-cleaning","oriental-rug-cleaning","tile-and-grout-cleaning","hardwood-floor-cleaning","vinyl-floor-cleaning","natural-stone-cleaning","pet-stain-odor","water-damage-restoration","commercial-carpet-cleaning","car-seat-cleaning","drape-cleaning","outdoor-furniture-cleaning","leather-furniture-cleaning"],
  "setting": "home"|"commercial"|"outdoor"|"studio"|"unknown",
  "has_people": true|false,
  "has_text": true|false,           // any readable text/logo/watermark baked into the photo
  "text_content": "",               // the text if has_text, else ""
  "quality": "high"|"medium"|"low", // sharpness/lighting/composition for use as a website photo
  "orientation": "landscape"|"portrait"|"square",
  "alt": "concise accessible alt text, <=120 chars, no keyword stuffing",
  "caption": "one short phrase describing the scene",
  "best_for": ["hero"|"card"|"gallery"|"process"|"blog"]  // where this photo would work
}
Only include services that are clearly depicted. If nothing is clearly depicted, use an empty array. Return only JSON.`;

async function tagOne(key, file) {
  const sharp = (await import("sharp")).default;
  // Downsize to keep token cost low; 512px on the long edge is plenty for tagging.
  const buf = await sharp(file)
    .rotate()
    .resize(512, 512, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 70 })
    .toBuffer();
  const dataUrl = `data:image/jpeg;base64,${buf.toString("base64")}`;
  const meta = await sharp(buf).metadata();
  const json = await visionJson(key, VISION_MODEL, PROMPT, dataUrl);
  return { ...json, w: meta.width, h: meta.height };
}

async function main() {
  loadEnvLocal();
  const key = getKey();
  if (!key) throw new Error("OPENROUTER_API_KEY missing");

  const all = walk(MEDIA).filter((f) => isOriginal(f.split(/[\\/]/).pop()));
  const usable = all.filter((f) => statSync(f).size > 8000); // skip zero-byte/tiny
  const rel = (f) => relative(MEDIA, f).split("\\").join("/");

  const testIdx = process.argv.indexOf("--test");
  if (testIdx !== -1) {
    const n = Number(process.argv[testIdx + 1] || 5);
    console.log(`TEST: tagging ${n} images with ${VISION_MODEL}`);
    for (const f of usable.slice(0, n)) {
      try {
        const r = await tagOne(key, f);
        console.log(`\n${rel(f)}\n${JSON.stringify(r, null, 2)}`);
      } catch (e) {
        console.log(`\n${rel(f)}  ERROR ${e.message}`);
      }
    }
    return;
  }

  let existing = {};
  if (existsSync(OUT)) existing = JSON.parse(readFileSync(OUT, "utf8"));
  const todo = usable.filter((f) => !existing[rel(f)]);
  console.log(`Total originals: ${all.length}, usable: ${usable.length}, already tagged: ${Object.keys(existing).length}, to tag: ${todo.length}`);

  let done = 0;
  const results = await pool(todo, CONCURRENCY, async (f) => {
    const r = rel(f);
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const tag = await tagOne(key, f);
        existing[r] = tag;
        done++;
        if (done % 25 === 0) {
          writeFileSync(OUT, JSON.stringify(existing, null, 1));
          console.log(`  ${done}/${todo.length} tagged (checkpoint saved)`);
        }
        return tag;
      } catch (e) {
        if (attempt === 2) {
          existing[r] = { ok: false, error: e.message.slice(0, 120) };
          return null;
        }
        await sleep(800 * (attempt + 1));
      }
    }
  });

  writeFileSync(OUT, JSON.stringify(existing, null, 1));
  const okCount = Object.values(existing).filter((t) => t && t.ok).length;
  console.log(`DONE. Tagged ${Object.keys(existing).length}, usable photos: ${okCount}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
