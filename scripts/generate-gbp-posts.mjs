/**
 * Generate images for Google Business Profile "Update" posts.
 * Output: gbp-posts/<key>.jpg at 1200x900 (GBP's recommended 4:3 size).
 *
 * Usage: node scripts/generate-gbp-posts.mjs
 */
import { mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { generateImage, getKey, loadEnvLocal, sleep } from "./or-lib.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "gbp-posts");
mkdirSync(OUT, { recursive: true });

const STYLE =
  "photorealistic, natural light, shot on a full-frame camera, 35mm, crisp detail, realistic textures, no text, no words, no logos, no watermark, nobody looking at the camera";

const SHOTS = [
  {
    key: "01-air-ducts-fall",
    prompt: `A technician in a plain navy work uniform using a professional HEPA duct cleaning vacuum hose connected to a ceiling air vent in a bright Southern California living room, protective drop cloth on the floor. ${STYLE}`,
  },
  {
    key: "02-dryer-vent",
    prompt: `Close-up of a gloved technician pulling a thick clump of grey lint out of a disconnected dryer vent duct behind a white clothes dryer in a clean laundry room, a rotary vent brush on the floor. ${STYLE}`,
  },
  {
    key: "03-holiday-carpet",
    prompt: `A spotless light beige carpet in a warm, inviting Orange County living room prepared for holiday guests, sofa with neat throw pillows, soft afternoon sunlight, a professional carpet cleaning wand resting against the wall. ${STYLE}`,
  },
  {
    key: "04-pet-stains",
    prompt: `A happy golden retriever lying on a freshly cleaned cream carpet in a bright family room, carpet fibers look fresh and fluffy, calm cozy home. ${STYLE}`,
  },
  {
    key: "05-tile-grout",
    prompt: `Low-angle close-up of a light porcelain kitchen tile floor mid-cleaning by a professional crew: the left side has dark grey dirty grout lines, the right side has bright clean white grout and wet glistening tile, a commercial stainless-steel hard-surface cleaning wand with a round shrouded head attached to a thick industrial hose resting on the clean side, technician's work boots at the edge of frame. ${STYLE}`,
  },
  {
    key: "06-upholstery",
    prompt: `A technician using a small professional upholstery extraction tool on a light grey fabric sofa cushion in a modern living room, clean stripe visible on the fabric. ${STYLE}`,
  },
];

loadEnvLocal();
const key = getKey();
if (!key) throw new Error("OPENROUTER_API_KEY missing");

for (const s of SHOTS) {
  const file = join(OUT, `${s.key}.jpg`);
  if (existsSync(file)) {
    console.log(`skip ${s.key} (exists)`);
    continue;
  }
  try {
    const png = await generateImage(key, s.prompt, {
      aspect_ratio: "4:3",
      resolution: "2K",
      output_format: "png",
      quality: "high",
    });
    await sharp(png).resize(1200, 900, { fit: "cover" }).jpeg({ quality: 88 }).toFile(file);
    console.log(`generated ${s.key}.jpg`);
  } catch (e) {
    console.log(`FAILED ${s.key}: ${e.message}`);
  }
  await sleep(1500);
}
console.log("done");
