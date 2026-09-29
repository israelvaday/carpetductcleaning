/**
 * Generate one image per model sequentially and measure the real cost from
 * the key's usage counter. Output: gbp-posts/bakeoff/probe-<model>.png
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { generateImage, getKey, loadEnvLocal, sleep } from "./or-lib.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "gbp-posts/bakeoff");
mkdirSync(OUT, { recursive: true });

const MODELS = process.argv.slice(2);
const PROMPT =
  "Huntington Beach pier stretching over the Pacific Ocean at sunset, surfers in the water, wet sand reflecting the sky, " +
  "photographed on a full-frame camera with a 35mm lens, true-to-life colors, natural light, crisp detail. No text, no signs with words, no watermark.";

loadEnvLocal();
const key = getKey();

async function usage() {
  const r = await fetch("https://openrouter.ai/api/v1/key", { headers: { Authorization: `Bearer ${key}` } });
  return (await r.json()).data.usage;
}

for (const model of MODELS) {
  const before = await usage();
  try {
    const buf = await generateImage(key, PROMPT, { model, aspect_ratio: "4:3", resolution: "1K", output_format: "png", quality: "high" });
    writeFileSync(join(OUT, `probe-${model.replace(/[\/.]/g, "_")}.png`), buf);
    await sleep(8000); // let the usage counter settle
    const after = await usage();
    console.log(`${model.padEnd(36)} $${(after - before).toFixed(3)}`);
  } catch (e) {
    console.log(`${model.padEnd(36)} FAIL ${e.message.slice(0, 150)}`);
  }
}
console.log(`total usage now: $${(await usage()).toFixed(2)}`);
