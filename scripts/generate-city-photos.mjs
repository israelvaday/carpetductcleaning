/**
 * Generate one hyper-realistic landmark photo per service-area city.
 * These power the /locations city tiles, so no work-photo pool slots are
 * spent on city cards (the pool is too small to cover 28 carpet cities).
 *
 * Output: media/generated/city-<slug>.png
 * Usage:  node scripts/generate-city-photos.mjs [--test]
 */
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { generateImage, getKey, loadEnvLocal, sleep } from "./or-lib.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "media/generated");
mkdirSync(OUT, { recursive: true });

const STYLE =
  "photorealistic, natural daylight, shot on a full-frame camera, crisp detail, no text, no signs with words, no watermark, no logo, no people looking at the camera";

// One distinctive, recognizable scene per city. Avoid brand names and any
// signage — the model garbles text.
const CITY_SCENES = {
  "aliso-viejo": "Coastal sage hills and a hiking trail in Aliso and Wood Canyons near Aliso Viejo, California",
  anaheim: "Palm-tree lined boulevard in Anaheim, California at golden hour",
  "anaheim-hills": "Rolling hillside homes of Anaheim Hills, California at dusk",
  "buena-park": "Quiet suburban street with tall palm trees in Buena Park, California",
  "corona-del-mar": "Cliffs and cove at Corona del Mar State Beach, California",
  "costa-mesa": "Modern performing-arts plaza with sculptural architecture in Costa Mesa, California",
  "coto-de-caza": "Oak trees and rolling hills behind a gated-community entrance in Coto de Caza, California",
  "dana-point": "Sailboats in Dana Point harbor at golden hour, California",
  "dove-canyon": "Golf course fairway among rolling hills in Dove Canyon, California",
  "east-irvine": "Modern suburban neighborhood park with green lawns in Irvine, California",
  "foothill-ranch": "Suburban lake with a fountain in Foothill Ranch, California",
  "fountain-valley": "Green park lawns and a lake in Fountain Valley, California",
  fullerton: "Historic downtown street with brick buildings in Fullerton, California",
  "garden-grove": "Suburban street shaded by jacaranda trees in Garden Grove, California",
  "huntington-beach": "Huntington Beach pier stretching over the Pacific ocean at sunset",
  irvine: "Modern outdoor shopping district with palm trees and a giant ferris wheel in Irvine, California",
  "ladera-ranch": "Suburban village with red-tile roofs and a water tower in Ladera Ranch, California",
  "laguna-beach": "Turquoise cove with cliffs at Laguna Beach, California",
  "laguna-hills": "Hillside suburban homes in Laguna Hills, California",
  "santa-ana": "Historic courthouse plaza in downtown Santa Ana, California",
  "seal-beach": "Wooden pier over the ocean at Seal Beach, California",
  stanton: "Quiet suburban neighborhood street with palm trees in Stanton, California",
  "trabuco-canyon": "Oak-lined rural road in Trabuco Canyon, California",
  tustin: "Historic old-town street with vintage storefronts in Tustin, California",
  "tustin-ranch": "Golf course greens and upscale homes in Tustin Ranch, California",
  westminster: "Quiet suburban street with palm trees in Westminster, California",
  woodbridge: "Wooden footbridge over a calm lake in the Woodbridge village of Irvine, California",
  "yorba-linda": "Suburban hills with white horse-trail fencing in Yorba Linda, California",
};

const test = process.argv.includes("--test");

loadEnvLocal();
const key = getKey();
if (!key) throw new Error("OPENROUTER_API_KEY missing");

const entries = Object.entries(CITY_SCENES);
const todo = (test ? entries.slice(0, 1) : entries).filter(
  ([slug]) => !existsSync(join(OUT, `city-${slug}.png`))
);
console.log(`generating ${todo.length} city photos...`);
let done = 0;
for (const [slug, scene] of todo) {
  try {
    const buf = await generateImage(key, `${scene}. ${STYLE}`, {
      aspect_ratio: "4:3",
      resolution: "1K",
      output_format: "png",
      quality: "high",
    });
    writeFileSync(join(OUT, `city-${slug}.png`), buf);
    done++;
    console.log(`[${done}/${todo.length}] city-${slug}.png (${(buf.length / 1024).toFixed(0)} KB)`);
  } catch (e) {
    console.log(`FAILED city-${slug}: ${e.message}`);
  }
  if (!test) await sleep(1500);
}
console.log("done");
