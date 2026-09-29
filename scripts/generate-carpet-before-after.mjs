/**
 * Five hyper-real carpet before/after pairs for the homepage slider.
 * Top image model. After is generated first; before repeats the same camera.
 *
 *   node scripts/generate-carpet-before-after.mjs
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { generateImage, getKey, loadEnvLocal, sleep } from "./or-lib.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public/images");
mkdirSync(OUT, { recursive: true });

const LOCK =
  "Photorealistic, shot on a full-frame camera, natural daylight, true colors, real carpet texture. " +
  "No text, no logos, no watermark, no people, no hands.";

const PAIRS = [
  {
    id: "wine-living",
    alt: "Living room carpet, red wine stain",
    scene:
      "Orange County living room. Camera on a tripod about 3 feet high, looking slightly down. Cream sofa with two navy pillows on the left. Dark wood coffee table in the center. Large window with palm trees in the background. Beige wall-to-wall carpet fills the foreground.",
    dirty: "The carpet is soiled, with a dark red wine stain beside the coffee table and gray traffic lanes toward the sofa.",
    clean: "The carpet is freshly cleaned, even light beige, with faint hot-water cleaning lines and no stain.",
  },
  {
    id: "stairs",
    alt: "Carpeted stairs, soiled treads",
    scene:
      "Interior staircase in a California home, shot from the bottom looking up. White balusters and a wood handrail on the right. Beige carpet on every tread. A window at the top of the stairs. Same stair count, same railing, same camera.",
    dirty: "The carpet treads are dull gray-brown in the traffic path, darker at the nosing.",
    clean: "The carpet treads are clean light beige, fibers lifted, no gray path.",
  },
  {
    id: "pet-hall",
    alt: "Hallway carpet, pet stain",
    scene:
      "Narrow hallway, camera centered at waist height looking down the hall. White walls, one closed door on the left, daylight from a window at the far end. Light gray wall-to-wall carpet.",
    dirty: "A yellow-brown pet stain and a darker ring sit in the middle of the hallway carpet.",
    clean: "The same hallway carpet is uniformly clean light gray, the stain gone.",
  },
  {
    id: "bedroom",
    alt: "Bedroom carpet, traffic lanes",
    scene:
      "Bedroom corner. Camera low, looking across the floor. White bed frame and a gray duvet at the top of the frame. Nightstand with a lamp on the right. Window light from the left. Plush light-gray carpet.",
    dirty: "A dark traffic lane runs beside the bed and the carpet looks matted and dusty.",
    clean: "The carpet is freshly cleaned, even light gray, with soft cleaning lines and no traffic lane.",
  },
  {
    id: "coffee-dining",
    alt: "Dining room carpet, coffee spill",
    scene:
      "Dining room. Camera at table height looking slightly down. Wood dining table and four chairs. A window with white blinds behind the table. Beige carpet under the table.",
    dirty: "A brown coffee spill and splatter marks sit on the carpet under the near edge of the table.",
    clean: "The carpet under the table is clean beige with no spill.",
  },
];

loadEnvLocal();
const key = getKey();
if (!key) throw new Error("OPENROUTER_API_KEY missing");

async function shot(prompt) {
  return generateImage(key, prompt, {
    model: "openai/gpt-image-2",
    aspect_ratio: "4:3",
    resolution: "1K",
    output_format: "png",
    quality: "high",
  });
}

async function toWebp(buf, name) {
  const file = join(OUT, name);
  await sharp(buf).resize(1200, 900, { fit: "cover" }).webp({ quality: 86 }).toFile(file);
  console.log(`wrote ${name}`);
}

for (const pair of PAIRS) {
  try {
    const after = await shot(`${pair.scene} ${pair.clean} ${LOCK}`);
    await toWebp(after, `ba-carpet-${pair.id}-after.webp`);
    await sleep(800);
    const before = await shot(
      `Matching before photo. Identical camera, identical room, identical furniture placement. ${pair.scene} ${pair.dirty} ${LOCK}`,
    );
    await toWebp(before, `ba-carpet-${pair.id}-before.webp`);
    console.log(`pair ${pair.id} done`);
  } catch (e) {
    console.log(`FAILED ${pair.id}: ${e.message}`);
  }
  await sleep(800);
}
console.log("done");
