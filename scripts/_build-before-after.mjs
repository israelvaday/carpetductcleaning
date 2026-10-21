/**
 * One-shot: convert the user's 16 picked before/after pairs from
 * media/drive/photos into light webp files under public/images and
 * rewrite content/before-after.json (replacing the generated pairs).
 *
 *   node scripts/_build-before-after.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public/images");
mkdirSync(OUT, { recursive: true });

const tags = JSON.parse(readFileSync(join(ROOT, "content/drive-tags.json"), "utf8"));

// path (job folder + file) -> preview jpg
const byPath = new Map();
for (const t of Object.values(tags)) byPath.set(t.path, t);

// The 16 pairs the user kept in the picker. job = parent folder in Drive.
const PICKS = [
  { slug: "ba-area-rug", job: "Area Rug", before: "IMG_0942.jpg", after: "IMG_0943.jpg",
    alt: "Area rug, soiled field beside the cleaned rug",
    caption: "Area rug — full wash" },
  { slug: "ba-dana-point-couch", job: "2026 pictures/upholstery/Dana point - couch", before: "IMG_4451.JPG", after: "IMG_4454.JPG",
    alt: "Couch cushions, soiled seats beside the cleaned couch",
    caption: "Dana Point couch — seat cushions cleaned" },
  { slug: "ba-orange-stains", job: "2026 pictures/carpet/Orange - stains", before: "IMG_4413.JPG", after: "IMG_4414.JPG",
    alt: "Bedroom carpet, dark stains beside the cleaned carpet",
    caption: "Orange — carpet stains removed" },
  { slug: "ba-costa-mesa-red-spot", job: "2026 pictures/carpet/Costa Mesa - red spot", before: "IMG_4446.JPG", after: "IMG_4447.JPG",
    alt: "Carpet with a red spot beside the cleaned carpet",
    caption: "Costa Mesa — red spot lifted out" },
  { slug: "ba-irvine-pet-stain", job: "2026 pictures/carpet/Irvine pet stain", before: "IMG_4431.JPG", after: "AE551AAF-C078-41BE-8946-49AF7A78C847.JPG",
    alt: "Carpet with pet stains beside the cleaned carpet",
    caption: "Irvine — pet stains removed" },
  { slug: "ba-irvine-pet-hall", job: "2026 pictures/carpet/Irvine pet treatment", before: "IMG_0185.HEIC", after: "IMG_0196.HEIC",
    alt: "Hallway carpet, soiled lane beside the cleaned hallway",
    caption: "Irvine hallway — pet treatment and clean" },
  { slug: "ba-laguna-niguel-paint", job: "2026 pictures/carpet/Laguna Niguel - painting color carpet", before: "IMG_0396.JPG", after: "IMG_0399.JPG",
    alt: "Carpet with paint color beside the cleaned carpet",
    caption: "Laguna Niguel — paint lifted from carpet" },
  { slug: "ba-newport-coast-spot", job: "2026 pictures/carpet/Newport cost - spot", before: "IMG_4201.JPG", after: "IMG_4203.JPG",
    alt: "Carpet with a dark spot beside the cleaned carpet",
    caption: "Newport Coast — spot removal" },
  { slug: "ba-water-damage", job: "water damage new", before: "IMG_4923.HEIC", after: "IMG_8414.JPG",
    alt: "Water-damaged carpet beside the dried and cleaned carpet",
    caption: "Water damage — dried and cleaned" },
  { slug: "ba-upholstery-seat", job: "Upholstery", before: "PHOTO-2023-10-04-19-32-23.jpg", after: "PHOTO-2023-10-04-19-32-24.jpg",
    alt: "Upholstered seat, soiled fabric beside the cleaned seat",
    caption: "Upholstery — fabric deep cleaned" },
  { slug: "ba-carpet-stain", job: "Carpet", before: "IMG_1142.jpg", after: "IMG_1147.jpg",
    alt: "Carpet with a stain beside the cleaned carpet",
    caption: "Carpet stain — gone after one pass" },
  { slug: "ba-stairs-traffic", job: "Carpet", before: "IMG_3970.HEIC", after: "IMG_3972.HEIC",
    alt: "Carpeted stairs, soiled treads beside the cleaned stairs",
    caption: "Carpeted stairs — traffic soil cleaned" },
  { slug: "ba-new-carpet-stains", job: "Carpet/New Carpet", before: "IMG_7523.JPG", after: "IMG_7524.JPG",
    alt: "Carpet with stains beside the cleaned carpet",
    caption: "Carpet stains — removed" },
  { slug: "ba-stairs-clean", job: "Carpet/New Carpet", before: "IMG_7046.JPG", after: "IMG_7047.JPG",
    alt: "Carpeted stairs, soiled treads beside the cleaned stairs",
    caption: "Stairs — every tread cleaned" },
  { slug: "ba-cabinet-spot", job: "Carpet/New Carpet", before: "IMG_5375.HEIC", after: "IMG_5376.HEIC",
    alt: "Carpet spot by a cabinet beside the cleaned carpet",
    caption: "Carpet spot by the cabinet — removed" },
  { slug: "ba-rug-brightened", job: "2026 pictures", before: "IMG_0164.HEIC", after: "IMG_0152.HEIC",
    alt: "Area rug, dull and soiled beside the cleaned rug",
    caption: "Area rug — cleaned and brightened" },
];

async function convert(previewRel, outName) {
  const img = sharp(join(ROOT, previewRel)).rotate();
  const meta = await img.metadata();
  const buf = await img
    .resize({ width: 1400, height: 1400, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 74 })
    .toBuffer();
  writeFileSync(join(OUT, outName), buf);
  const out = await sharp(buf).metadata();
  return { width: out.width, height: out.height, kb: Math.round(buf.length / 1024), srcDims: `${meta.width}x${meta.height}` };
}

const entries = [];
for (const p of PICKS) {
  const b = byPath.get(`${p.job}/${p.before}`);
  const a = byPath.get(`${p.job}/${p.after}`);
  if (!b || !a) {
    console.error(`MISSING: ${p.job} | before=${p.before} ${b ? "ok" : "NOT FOUND"} | after=${p.after} ${a ? "ok" : "NOT FOUND"}`);
    continue;
  }
  const bOut = await convert(b.preview, `${p.slug}-before.webp`);
  const aOut = await convert(a.preview, `${p.slug}-after.webp`);
  entries.push({
    before: `/images/${p.slug}-before.webp`,
    after: `/images/${p.slug}-after.webp`,
    width: aOut.width,
    height: aOut.height,
    alt: p.alt,
    caption: p.caption,
  });
  console.log(`${p.slug}: before ${bOut.kb}KB (${bOut.width}x${bOut.height}), after ${aOut.kb}KB (${aOut.width}x${aOut.height})`);
  console.log(`   before shows: ${b.what_it_shows}`);
  console.log(`   after  shows: ${a.what_it_shows}`);
}

if (entries.length === PICKS.length) {
  writeFileSync(join(ROOT, "content/before-after.json"), JSON.stringify(entries, null, 2) + "\n");
  console.log(`\nwrote content/before-after.json with ${entries.length} real pairs`);
} else {
  console.error(`\nNOT writing JSON: only ${entries.length} of ${PICKS.length} resolved`);
  process.exitCode = 1;
}
