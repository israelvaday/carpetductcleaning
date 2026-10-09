/**
 * OCR and tag every photo and video in content/drive-index.json.
 *
 * Photos: a 1600px preview is saved under media/drive/photos/.
 * Videos: three frames (start, middle, later) are read, then the download is deleted.
 *
 *   node scripts/tag-drive.mjs --test     # 2 photos + 1 video, print only
 *   node scripts/tag-drive.mjs            # full run, skips ids already in drive-tags.json
 *
 * Writes content/drive-tags.json. Safe to stop and run again.
 */
import { execFile } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync, existsSync, rmSync, createWriteStream } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { promisify } from "node:util";
import { getKey, loadEnvLocal, pool, sleep } from "./or-lib.mjs";

const exec = promisify(execFile);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const INDEX = join(ROOT, "content/drive-index.json");
const OUT = join(ROOT, "content/drive-tags.json");
const PHOTO_DIR = join(ROOT, "media/drive/photos");
const VIDEO_DIR = join(ROOT, "media/drive/videos");
const MODEL = process.env.OPENROUTER_VISION_MODEL || "google/gemini-2.5-flash-lite";
const PHOTO_CONCURRENCY = 6;
const VIDEO_CONCURRENCY = 2;
const MAX_VIDEO_BYTES = 150 * 1024 * 1024;

const SERVICES = [
  "carpet-cleaning",
  "encapsulation-carpet-cleaning",
  "pet-stain-odor",
  "hardwood-floor-cleaning",
  "tile-and-grout-cleaning",
  "vinyl-floor-cleaning",
  "natural-stone-cleaning",
  "floor-cleaning",
  "air-duct-cleaning",
  "dryer-vent-cleaning",
  "commercial-air-duct-cleaning",
  "area-rug-cleaning",
  "oriental-rug-cleaning",
  "rug-pickup",
  "upholstery-cleaning",
  "couch-cleaning",
  "leather-furniture-cleaning",
  "microfiber-couch-cleaning",
  "drape-cleaning",
  "outdoor-furniture-cleaning",
  "car-seat-cleaning",
  "commercial",
  "commercial-carpet-cleaning",
  "water-damage-restoration",
  "emergency-cleaning",
];

const MOMENTS = [
  "before",
  "during",
  "after",
  "before-and-after",
  "equipment",
  "vehicle",
  "team",
  "logo",
  "graphic",
  "other",
];

function promptFor(item, frameCount) {
  const frameNote =
    item.media === "video"
      ? `This is a video. You are looking at ${frameCount} frames in order: start, middle, later. Describe the clip, not a single frame only. Put any text you can read in any frame into ocr.`
      : "This is one photo.";
  return `You catalog real job media for Carpet & Duct Cleaning in Orange County. ${frameNote}
The file was stored in the Drive folder "${item.folder}". Trust the picture over the folder name when they disagree.

Read every visible word: van lettering, signs, labels, watermarks, phone numbers, shirts. Copy it into ocr exactly. If there is no readable text, ocr is an empty string.

Return only JSON with these fields:
{
  "ocr": "",
  "what_it_shows": "One plain sentence. Name the surface, its condition, and what is happening. No slogans.",
  "service": "one slug, or none",
  "moment": "before | during | after | before-and-after | equipment | vehicle | team | logo | graphic | other",
  "where": "short place, such as living room, stairs, ceiling vent, dryer hood, van",
  "usable_on_site": true,
  "why": "One sentence saying why this can or cannot go on the public website.",
  "has_faces": false,
  "has_readable_text": false,
  "quality": "high | medium | low"
}

service must be one of: ${SERVICES.join(", ")}, or none.
moment must be one of: ${MOMENTS.join(", ")}.
usable_on_site is false for screenshots, memes, logo-only graphics, unusably blurry shots, a customer's face as the subject, or a different company's name.
before = still dirty or stained. after = visibly cleaned. during = tools or a person working.`;
}

function normalize(raw, item, extra) {
  const service = SERVICES.includes(raw.service) ? raw.service : "none";
  const moment = MOMENTS.includes(raw.moment) ? raw.moment : "other";
  const quality = ["high", "medium", "low"].includes(raw.quality) ? raw.quality : "low";
  const ocr = String(raw.ocr || "").replace(/\s+/g, " ").trim();
  return {
    file: item.name,
    folder: item.folder,
    path: item.path,
    media: item.media,
    ocr,
    what_it_shows: String(raw.what_it_shows || "").trim(),
    service,
    moment,
    where: String(raw.where || "").trim(),
    usable_on_site: Boolean(raw.usable_on_site) && service !== "none" && quality !== "low",
    why: String(raw.why || "").trim(),
    has_faces: Boolean(raw.has_faces),
    has_readable_text: Boolean(raw.has_readable_text) || ocr.length > 0,
    quality,
    ...extra,
  };
}

async function vision(key, prompt, dataUrls) {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://carpetductcleaning.com",
      "X-Title": "Carpet And Duct Cleaning",
    },
    signal: AbortSignal.timeout(120_000),
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.1,
      response_format: { type: "json_object" },
      max_tokens: 700,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            ...dataUrls.map((url) => ({ type: "image_url", image_url: { url } })),
          ],
        },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Vision ${res.status}: ${(await res.text()).slice(0, 240)}`);
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("No vision content");
  return JSON.parse(text);
}

async function toDataUrl(jpegBuf) {
  const sharp = (await import("sharp")).default;
  const small = await sharp(jpegBuf)
    .rotate()
    .resize(1280, 1280, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 75 })
    .toBuffer();
  return `data:image/jpeg;base64,${small.toString("base64")}`;
}

async function fetchPreview(id) {
  const res = await fetch(`https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w1600`, {
    redirect: "follow",
    signal: AbortSignal.timeout(60_000),
  });
  const buf = Buffer.from(await res.arrayBuffer());
  if (!res.ok || buf.length < 2000) throw new Error(`preview ${res.status} ${buf.length}b`);
  const sharp = (await import("sharp")).default;
  return sharp(buf).rotate().jpeg({ quality: 82 }).toBuffer();
}

async function fetchPhoto(id, dest) {
  if (existsSync(dest) && readFileSync(dest).length > 4000) return readFileSync(dest);
  const jpeg = await fetchPreview(id);
  writeFileSync(dest, jpeg);
  return jpeg;
}

async function downloadVideo(id, dest) {
  const url = `https://drive.usercontent.google.com/download?id=${encodeURIComponent(id)}&export=download&confirm=t`;
  const res = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(180_000) });
  const len = Number(res.headers.get("content-length") || 0);
  const type = res.headers.get("content-type") || "";
  if (!res.ok || type.includes("text/html")) throw new Error(`video download ${res.status} ${type}`);
  if (len > MAX_VIDEO_BYTES) {
    res.body?.cancel();
    throw new Error(`video too large ${len}`);
  }
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest));
  return len;
}

async function videoFrames(file, id) {
  let duration = 0;
  try {
    const { stdout } = await exec("ffprobe", [
      "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file,
    ]);
    duration = Number(String(stdout).trim()) || 0;
  } catch {
    duration = 0;
  }
  const times = duration > 1.5 ? [0.4, duration * 0.35, duration * 0.7] : [0];
  const bufs = [];
  for (let i = 0; i < times.length; i++) {
    const frame = join(VIDEO_DIR, `${id}-${i + 1}.jpg`);
    await exec("ffmpeg", [
      "-y", "-ss", String(Math.max(0, times[i] - 0.05)), "-i", file,
      "-frames:v", "1", "-q:v", "3", frame,
    ]);
    bufs.push(readFileSync(frame));
    rmSync(frame, { force: true });
  }
  return { bufs, duration };
}

async function tagOne(key, item) {
  if (item.media === "photo") {
    const dest = join(PHOTO_DIR, `${item.id}.jpg`);
    const buf = await fetchPhoto(item.id, dest);
    const raw = await vision(key, promptFor(item, 1), [await toDataUrl(buf)]);
    return normalize(raw, item, { preview: `media/drive/photos/${item.id}.jpg` });
  }

  const dest = join(VIDEO_DIR, `${item.id}.mp4`);
  try {
    await downloadVideo(item.id, dest);
    const { bufs, duration } = await videoFrames(dest, item.id);
    const urls = [];
    for (const buf of bufs) urls.push(await toDataUrl(buf));
    const raw = await vision(key, promptFor(item, bufs.length), urls);
    return normalize(raw, item, {
      frames_checked: bufs.length,
      duration_sec: Math.round(duration),
    });
  } catch (e) {
    const msg = String(e?.message || e);
    if (!/too large|text\/html|preview /.test(msg)) throw e;
    const cover = await fetchPreview(item.id);
    const raw = await vision(key, promptFor(item, 1) + " Only the cover frame was available. Say that in why.", [
      await toDataUrl(cover),
    ]);
    return normalize(raw, item, { frames_checked: 1, cover_only: true });
  } finally {
    rmSync(dest, { force: true });
  }
}

async function tagWithRetry(key, item) {
  let last;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await tagOne(key, item);
    } catch (e) {
      last = e;
      await sleep(900 * (attempt + 1));
    }
  }
  return {
    file: item.name,
    folder: item.folder,
    path: item.path,
    media: item.media,
    ocr: "",
    what_it_shows: "",
    service: "none",
    moment: "other",
    where: "",
    usable_on_site: false,
    why: `Could not read this file: ${String(last?.message || last).slice(0, 180)}`,
    has_faces: false,
    has_readable_text: false,
    quality: "low",
    error: true,
  };
}

function save(tags) {
  writeFileSync(OUT, JSON.stringify(tags, null, 1));
}

async function main() {
  loadEnvLocal();
  const key = getKey();
  if (!key) throw new Error("OPENROUTER_API_KEY missing");
  if (!existsSync(INDEX)) throw new Error("Run node scripts/index-drive.mjs first");

  mkdirSync(PHOTO_DIR, { recursive: true });
  mkdirSync(VIDEO_DIR, { recursive: true });

  const index = JSON.parse(readFileSync(INDEX, "utf8"));
  const files = index.files.filter((f) => f.media === "photo" || f.media === "video");
  const tags = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : {};
  if (process.argv.includes("--retry-errors")) {
    for (const [id, tag] of Object.entries(tags)) {
      if (tag.error || String(tag.why || "").startsWith("Could not read")) delete tags[id];
    }
  }

  const test = process.argv.includes("--test");
  let todo = files.filter((f) => !tags[f.id]);
  if (test) {
    const photos = todo.filter((f) => f.media === "photo").slice(0, 2);
    const video = todo.find((f) => f.media === "video");
    todo = video ? [...photos, video] : photos;
    console.log(`TEST ${todo.length} files with ${MODEL}`);
  } else {
    console.log(`To tag: ${todo.length} (${files.length} photos+videos, ${Object.keys(tags).length} already done) model ${MODEL}`);
  }

  const photos = todo.filter((f) => f.media === "photo");
  const videos = todo.filter((f) => f.media === "video");
  let done = 0;

  async function runBatch(batch, size) {
    await pool(batch, size, async (item) => {
      const tag = await tagWithRetry(key, item);
      if (!test) {
        tags[item.id] = tag;
        done++;
        if (done % 20 === 0) {
          save(tags);
          console.log(`  ${done}/${todo.length} saved`);
        }
      } else {
        console.log(`\n${item.path}\n${JSON.stringify(tag, null, 2)}`);
      }
      return tag;
    });
  }

  await runBatch(photos, PHOTO_CONCURRENCY);
  await runBatch(videos, VIDEO_CONCURRENCY);
  if (!test) {
    save(tags);
    const vals = Object.values(tags);
    const usable = vals.filter((t) => t.usable_on_site).length;
    const errors = vals.filter((t) => t.error).length;
    console.log(`DONE. ${vals.length} tagged, ${usable} usable on the site, ${errors} unread.`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
