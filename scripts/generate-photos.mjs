/**
 * Generate the homepage hero and the four process-step photos.
 * Writes into media/generated/ (picked up by copy-public-images.mjs).
 *
 * Usage:
 *   node scripts/generate-photos.mjs            # skip files that exist
 *   node scripts/generate-photos.mjs --force    # regenerate everything
 *   node scripts/generate-photos.mjs --model openai/gpt-image-2.5-flare
 */
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { generateImage, getKey, loadEnvLocal, sleep } from "./or-lib.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "media/generated");
mkdirSync(OUT, { recursive: true });

const args = process.argv.slice(2);
const force = args.includes("--force");
const model = args.includes("--model") ? args[args.indexOf("--model") + 1] : "openai/gpt-image-2";

const STYLE =
  "Documentary-style photo of a real job, true-to-life colors, natural window light mixed with room light, " +
  "realistic textures and small real-world imperfections, shot on a full-frame camera with a 35mm lens. " +
  "No text, no words, no logos, no watermark, nobody looking at the camera.";

const SHOTS = [
  {
    key: "hero-home",
    aspect: "16:9",
    prompt: `Wide interior of a bright, upscale Orange County California living room with freshly cleaned plush light-beige carpet showing fresh cleaning lines, a professional carpet cleaning wand and hose in the foreground, coastal daylight through large windows, palm trees outside. ${STYLE}`,
  },
  {
    key: "process-book",
    aspect: "4:3",
    prompt: `A cleaning technician in a plain navy uniform polo standing on the front porch of a Southern California stucco home, handing a tablet to a homeowner at the open door, a plain white service van softly out of focus in the driveway. ${STYLE}`,
  },
  {
    key: "process-inspect",
    aspect: "4:3",
    prompt: `Close-up of a technician's gloved hand pressing a handheld moisture meter onto a beige wall-to-wall carpet in a bright living room, inspecting a faint stain before cleaning. ${STYLE}`,
  },
  {
    key: "process-clean",
    aspect: "4:3",
    prompt: `A stainless-steel truck-mounted hot-water extraction wand gliding across a light carpet, leaving a visibly cleaner stripe next to the darker uncleaned section, technician's work boots at the edge of frame. ${STYLE}`,
  },
  {
    key: "process-dry",
    aspect: "4:3",
    prompt: `A low-profile professional air mover fan blowing across a freshly cleaned light-grey carpet in an airy living room, sunlight on the damp fibers, furniture moved to the side on protective pads. ${STYLE}`,
  },
];

loadEnvLocal();
const key = getKey();
if (!key) throw new Error("OPENROUTER_API_KEY missing");

console.log(`model: ${model}`);
for (const s of SHOTS) {
  const file = join(OUT, `${s.key}.png`);
  if (!force && existsSync(file)) {
    console.log(`skip ${s.key} (exists)`);
    continue;
  }
  try {
    const buf = await generateImage(key, s.prompt, {
      model,
      aspect_ratio: s.aspect,
      resolution: "2K",
      output_format: "png",
      quality: "high",
    });
    writeFileSync(file, buf);
    console.log(`generated ${s.key} (${(buf.length / 1024).toFixed(0)} KB)`);
  } catch (e) {
    console.log(`FAILED ${s.key}: ${e.message}`);
  }
  await sleep(1000);
}
console.log("done");
