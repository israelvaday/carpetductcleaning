/**
 * Run one prompt through several image models to compare realism.
 * Output: gbp-posts/bakeoff/<model>.png
 * Usage: node scripts/_image-bakeoff.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { getKey, loadEnvLocal } from "./or-lib.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "gbp-posts/bakeoff");
mkdirSync(OUT, { recursive: true });

const MODELS = [
  "openai/gpt-image-2.5-flare",
  "openai/gpt-image-2",
  "black-forest-labs/flux.2-max",
  "krea/krea-2-large",
  "bytedance-seed/seedream-5-0-pro",
  "microsoft/mai-image-2.6",
  "google/gemini-3-pro-image",
];

const PROMPT =
  "Documentary-style photo taken on a job site by a professional dryer vent cleaning technician in a Southern California home laundry room. " +
  "The white dryer has been pulled away from the wall; the 4-inch semi-rigid aluminum vent duct is disconnected and a gloved hand is pulling a thick, matted clump of grey-brown lint out of the duct opening. " +
  "A long black rotary vent-cleaning brush rod lies coiled on the tile floor. Real-world imperfections: scuffs on the baseboard, a little lint dust on the floor, natural window light mixed with the room's ceiling light. " +
  "Shot on a Canon EOS R5, 35mm lens, f/4, true-to-life colors, sharp focus on the lint, realistic skin and fabric textures. " +
  "No text, no words, no logos, no watermark, no faces.";

loadEnvLocal();
const key = getKey();

async function gen(model) {
  const res = await fetch("https://openrouter.ai/api/v1/images", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    signal: AbortSignal.timeout(240_000),
    body: JSON.stringify({ model, prompt: PROMPT, aspect_ratio: "4:3", resolution: "2K", output_format: "png", quality: "high" }),
  });
  if (!res.ok) throw new Error(`${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  const item = data.data?.[0];
  if (item?.b64_json) return Buffer.from(item.b64_json, "base64");
  if (item?.url) return Buffer.from(await (await fetch(item.url)).arrayBuffer());
  throw new Error("no image in response");
}

await Promise.all(
  MODELS.map(async (model) => {
    const t = Date.now();
    try {
      const buf = await gen(model);
      const name = model.replace(/[\/.]/g, "_");
      writeFileSync(join(OUT, `${name}.png`), buf);
      const m = await sharp(buf).metadata();
      console.log(`OK   ${model.padEnd(36)} ${m.width}x${m.height}  ${((Date.now() - t) / 1000).toFixed(0)}s`);
    } catch (e) {
      console.log(`FAIL ${model.padEnd(36)} ${e.message}`);
    }
  })
);
