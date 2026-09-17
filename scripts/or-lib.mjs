/**
 * Shared OpenRouter client for carpetductcleaning.com generation.
 * Key comes from .env.local (OPENROUTER_API_KEY) or the environment.
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ENV_PATH = join(__dirname, "../.env.local");
const SITE = "https://israelvaday.github.io/carpetductcleaning";
const APP_TITLE = "Carpet And Duct Cleaning";

export function loadEnvLocal() {
  if (!existsSync(ENV_PATH)) return;
  for (const line of readFileSync(ENV_PATH, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")))
      v = v.slice(1, -1);
    if (!process.env[k]) process.env[k] = v;
  }
}

export function getKey() {
  return process.env.OPENROUTER_API_KEY || "";
}

function headers(key) {
  return {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    "HTTP-Referer": SITE,
    "X-Title": APP_TITLE,
  };
}

export async function chatJson(key, model, system, user, temperature = 0.7) {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: headers(key),
    signal: AbortSignal.timeout(180_000),
    body: JSON.stringify({
      model,
      temperature,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Chat ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("No chat content");
  return JSON.parse(text);
}

/** Vision: send one image (data URL) + prompt, get JSON back. */
export async function visionJson(key, model, prompt, dataUrl, temperature = 0.2) {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: headers(key),
    signal: AbortSignal.timeout(120_000),
    body: JSON.stringify({
      model,
      temperature,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: dataUrl } },
          ],
        },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Vision ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("No vision content");
  return JSON.parse(text);
}

/** Generate one image via OpenRouter Images API; returns Buffer. */
export async function generateImage(key, prompt, opts = {}) {
  const {
    model = "google/gemini-3-pro-image-preview",
    aspect_ratio = "16:9",
    resolution = "1K",
    output_format = "png",
    quality = "high",
  } = opts;
  const res = await fetch("https://openrouter.ai/api/v1/images", {
    method: "POST",
    headers: headers(key),
    signal: AbortSignal.timeout(180_000),
    body: JSON.stringify({ model, prompt, aspect_ratio, resolution, output_format, quality }),
  });
  if (!res.ok) throw new Error(`Image ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  const b64 = data.data?.[0]?.b64_json;
  if (!b64) throw new Error("No b64_json in image response");
  return Buffer.from(b64, "base64");
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Tiny concurrency pool. */
export async function pool(items, size, fn) {
  const out = new Array(items.length);
  let i = 0;
  const workers = Array.from({ length: size }, async () => {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx], idx);
    }
  });
  await Promise.all(workers);
  return out;
}
