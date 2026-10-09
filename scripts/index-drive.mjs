/**
 * List every file in the public "Carpet and duct cleaning" Google Drive folder.
 *
 *   node scripts/index-drive.mjs
 *
 * Writes content/drive-index.json. Does not download the files.
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT_ID = "1U-zHCNNd1YssVXzoJk_6SZrtwPGpeAcg";
const OUT = join(dirname(fileURLToPath(import.meta.url)), "../content/drive-index.json");

const PHOTO = new Set(["jpg", "jpeg", "png", "webp", "gif", "heic", "heif"]);
const VIDEO = new Set(["mp4", "mov", "m4v", "webm"]);

function decode(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .trim();
}

function extOf(name) {
  const m = name.toLowerCase().match(/\.([a-z0-9]{1,5})$/);
  return m ? m[1] : "";
}

function mediaOf(name) {
  const ext = extOf(name);
  if (PHOTO.has(ext)) return "photo";
  if (VIDEO.has(ext)) return "video";
  return "other";
}

async function list(id) {
  let lastErr;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(`https://drive.google.com/embeddedfolderview?id=${id}`);
      if (!res.ok) throw new Error(`list ${id} ${res.status}`);
      const html = await res.text();
      const items = [];
      for (const part of html.split('class="flip-entry"').slice(1)) {
        const title = (part.match(/flip-entry-title">([^<]+)/) || [])[1];
        if (!title) continue;
        const name = decode(title);
        const folder = (part.match(/\/drive\/folders\/([^"?]+)/) || [])[1];
        const file = (part.match(/\/file\/d\/([^/?]+)/) || [])[1];
        if (folder) items.push({ kind: "folder", id: folder, name });
        else if (file) items.push({ kind: "file", id: file, name });
      }
      return items;
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
    }
  }
  throw lastErr;
}

async function walk(id, folder, parts, out) {
  const kids = await list(id);
  for (const k of kids) {
    if (k.kind === "folder") {
      await walk(k.id, folder, [...parts, k.name], out);
      continue;
    }
    out.push({
      id: k.id,
      name: k.name,
      folder,
      path: [...parts, k.name].join("/"),
      ext: extOf(k.name),
      media: mediaOf(k.name),
    });
  }
}

const top = await list(ROOT_ID);
const files = [];
for (const folder of top.filter((x) => x.kind === "folder")) {
  const before = files.length;
  await walk(folder.id, folder.name, [folder.name], files);
  console.log(`${folder.name}: ${files.length - before}`);
}

const counts = { photo: 0, video: 0, other: 0 };
for (const f of files) counts[f.media] += 1;

const index = {
  source: `https://drive.google.com/drive/folders/${ROOT_ID}`,
  indexedAt: new Date().toISOString(),
  counts,
  files,
};
writeFileSync(OUT, JSON.stringify(index, null, 1));
console.log(`Wrote ${files.length} files (${counts.photo} photos, ${counts.video} videos, ${counts.other} other) to content/drive-index.json`);
