/**
 * Generate hyper-realistic photos for slots with no good real-photo coverage.
 * Writes into media/generated/ and prints the path so it can be wired into the
 * image map. Uses the cheap high-quality image model.
 *
 * Usage:
 *   node scripts/generate-photos.mjs --test        # one image, print cost path
 *   node scripts/generate-photos.mjs               # the full gap set
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { generateImage, getKey, loadEnvLocal, sleep } from "./or-lib.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "media/generated");
mkdirSync(OUT, { recursive: true });

const STYLE =
  "photorealistic, natural window light, shallow depth of field, shot on a full-frame camera, 35mm, crisp detail, no text, no watermark, no logo, no people looking at the camera";

const SHOTS = [
  {
    key: "process-book",
    aspect: "4:3",
    prompt: `A professional cleaning technician in a clean navy uniform standing at the front door of a suburban Orange County California home, holding a tablet and greeting the homeowner, service van softly blurred in the driveway. ${STYLE}`,
  },
  {
    key: "process-inspect",
    aspect: "4:3",
    prompt: `Close-up of a technician's gloved hand using a moisture meter on a beige wall-to-wall carpet inside a bright modern living room, inspecting before cleaning. ${STYLE}`,
  },
  {
    key: "process-clean",
    aspect: "4:3",
    prompt: `A truck-mounted hot water extraction wand gliding across a light carpet leaving a clean stripe behind it, professional carpet cleaning in a bright home. ${STYLE}`,
  },
  {
    key: "process-dry",
    aspect: "4:3",
    prompt: `A low-profile air mover fan drying a freshly cleaned light-grey carpet in an airy living room, sunlight streaming in, spotless result. ${STYLE}`,
  },
  {
    key: "hero-home",
    aspect: "16:9",
    prompt: `Wide interior shot of a bright, upscale Orange County California living room with freshly cleaned plush carpet, a professional carpet cleaning machine and hose in the foreground, coastal daylight through large windows. ${STYLE}`,
  },
];

const test = process.argv.includes("--test");

loadEnvLocal();
const key = getKey();
if (!key) throw new Error("OPENROUTER_API_KEY missing");

const shots = test ? SHOTS.slice(0, 1) : SHOTS;
for (const s of shots) {
  try {
    const buf = await generateImage(key, s.prompt, {
      aspect_ratio: s.aspect,
      resolution: "2K",
      output_format: "png",
      quality: "high",
    });
    const file = join(OUT, `${s.key}.png`);
    writeFileSync(file, buf);
    console.log(`generated ${s.key} (${(buf.length / 1024).toFixed(0)} KB) -> media/generated/${s.key}.png`);
  } catch (e) {
    console.log(`FAILED ${s.key}: ${e.message}`);
  }
  if (!test) await sleep(1500);
}
console.log("done");
