/**
 * Compute tiny visual fingerprints for every before/after photo and suggest
 * matched pairs (same scene) per job. Writes content/_photo-matches.json.
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import sharp from "sharp";

const tags = JSON.parse(readFileSync("content/drive-tags.json", "utf8"));
const arr = Array.isArray(tags) ? tags : Object.values(tags);

const photos = arr.filter(
  (x) =>
    x.media === "photo" &&
    (x.moment === "before" || x.moment === "after") &&
    x.preview &&
    existsSync(x.preview)
);

// Group by job folder; keep jobs with both moments.
const groups = new Map();
for (const p of photos) {
  const job = p.path.split("/").slice(0, -1).join("/");
  if (!groups.has(job)) groups.set(job, []);
  groups.get(job).push(p);
}
const jobs = [...groups.entries()].filter(
  ([, items]) => items.some((p) => p.moment === "before") && items.some((p) => p.moment === "after")
);

// Fingerprint: 16x16 grayscale + mean rgb of 4x4 cells.
async function fingerprint(file) {
  const gray = await sharp(file).resize(16, 16, { fit: "fill" }).grayscale().raw().toBuffer();
  const rgb = await sharp(file).resize(4, 4, { fit: "fill" }).removeAlpha().raw().toBuffer();
  return { g: [...gray], c: [...rgb] };
}

function dist(a, b) {
  let dg = 0;
  for (let i = 0; i < a.g.length; i++) dg += (a.g[i] - b.g[i]) ** 2;
  let dc = 0;
  for (let i = 0; i < a.c.length; i++) dc += (a.c[i] - b.c[i]) ** 2;
  return Math.sqrt(dg / a.g.length) + Math.sqrt(dc / a.c.length);
}

const fps = new Map();
let done = 0;
for (const [, items] of jobs) {
  for (const p of items) {
    if (!fps.has(p.preview)) {
      try {
        fps.set(p.preview, await fingerprint(p.preview));
      } catch {
        fps.set(p.preview, null);
      }
      if (++done % 200 === 0) console.log("fingerprinted", done);
    }
  }
}
console.log("fingerprinted total:", done);

const out = [];
for (const [job, items] of jobs) {
  const befores = items.filter((p) => p.moment === "before" && fps.get(p.preview));
  const afters = items.filter((p) => p.moment === "after" && fps.get(p.preview));
  const scored = [];
  for (const b of befores) {
    for (const a of afters) {
      scored.push({ b, a, s: dist(fps.get(b.preview), fps.get(a.preview)) });
    }
  }
  // For every before photo keep its 2 best-matching afters, so no angle is missed.
  const byBefore = new Map();
  for (const m of scored) {
    if (!byBefore.has(m.b.file)) byBefore.set(m.b.file, []);
    byBefore.get(m.b.file).push(m);
  }
  let picks = [];
  for (const list of byBefore.values()) {
    list.sort((x, y) => x.s - y.s);
    picks.push(...list.slice(0, 2));
  }
  picks.sort((x, y) => x.s - y.s);
  picks = picks.slice(0, 60);
  out.push({
    job,
    service: items[0].service || "unknown",
    pairs: picks.map((m) => ({
      score: Math.round(m.s),
      before: { f: m.b.file, src: m.b.preview, d: m.b.what_it_shows || "" },
      after: { f: m.a.file, src: m.a.preview, d: m.a.what_it_shows || "" },
    })),
  });
}

writeFileSync("content/_photo-matches.json", JSON.stringify(out));
console.log("jobs:", out.length, "pairs:", out.reduce((n, j) => n + j.pairs.length, 0));
