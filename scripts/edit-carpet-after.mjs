/**
 * Rebuild each carpet "after" photo from its "before" so the slider
 * keeps the same room and only the carpet changes.
 * Also fills the pet-hall pair if the before file is missing.
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { generateImage, getKey, loadEnvLocal, sleep } from "./or-lib.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public/images");

const IDS = ["wine-living", "stairs", "pet-hall", "bedroom", "coffee-dining"];

const BEFORE_PROMPTS = {
  "pet-hall":
    "Photorealistic hallway in a California home. Camera at waist height looking down a narrow hall. White walls, one closed door on the left, daylight from a window at the far end. Light gray wall-to-wall carpet with a yellow-brown pet stain and a darker ring in the middle of the floor. No people, no text, no logos.",
};

const CLEAN =
  "Keep this exact photograph. Do not move the camera, furniture, walls, doors, windows, or lighting. " +
  "Only change the carpet: remove stains, spots, traffic lanes, and soil so it looks freshly professionally cleaned, " +
  "even color, with faint cleaning lines. No people, no text, no logos.";

loadEnvLocal();
const key = getKey();
if (!key) throw new Error("OPENROUTER_API_KEY missing");

async function generate(prompt, references) {
  const bodyNote = references ? " with reference" : "";
  const res = await fetch("https://openrouter.ai/api/v1/images", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://israelvaday.github.io/carpetductcleaning",
      "X-Title": "Carpet And Duct Cleaning",
    },
    signal: AbortSignal.timeout(180_000),
    body: JSON.stringify({
      model: "openai/gpt-image-2",
      prompt,
      aspect_ratio: "4:3",
      resolution: "1K",
      output_format: "png",
      quality: "high",
      ...(references ? { input_references: references } : {}),
    }),
  });
  if (!res.ok) throw new Error(`Image ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  const b64 = data.data?.[0]?.b64_json;
  if (!b64) throw new Error("No b64_json");
  console.log(`generated${bodyNote}`);
  return Buffer.from(b64, "base64");
}

async function webp(buf, name) {
  await sharp(buf).resize(1200, 900, { fit: "cover" }).webp({ quality: 86 }).toFile(join(OUT, name));
  console.log(`wrote ${name}`);
}

for (const id of IDS) {
  const beforeName = `ba-carpet-${id}-before.webp`;
  const afterName = `ba-carpet-${id}-after.webp`;
  const beforePath = join(OUT, beforeName);
  try {
    if (!existsSync(beforePath)) {
      const buf = await generate(BEFORE_PROMPTS[id]);
      await webp(buf, beforeName);
      await sleep(800);
    }
    const b64 = readFileSync(beforePath).toString("base64");
    const after = await generate(CLEAN, [
      { type: "image_url", image_url: { url: `data:image/webp;base64,${b64}` } },
    ]);
    await webp(after, afterName);
    console.log(`pair ${id} aligned`);
  } catch (e) {
    console.log(`FAILED ${id}: ${e.message}`);
  }
  await sleep(600);
}
console.log("edit done");
