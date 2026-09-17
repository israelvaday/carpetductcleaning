/**
 * Build content/image-map.json from the vision tags in content/photo-tags.json.
 *
 * Strategy: keep the hand-curated brand/hero/service picks from the existing
 * map (they were chosen by eye), and use the vision tags to (a) fill any
 * service slot that is missing or weak, (b) build deep, non-repeating city
 * pools, and (c) assemble a varied work gallery. A single global used-set
 * guarantees no photo is assigned twice across the whole manifest.
 *
 * Usage: node scripts/build-image-map.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TAGS = JSON.parse(readFileSync(join(ROOT, "content/photo-tags.json"), "utf8"));
const URL_MAP = JSON.parse(readFileSync(join(ROOT, "audit/next-url-map.json"), "utf8"));
const OLD = JSON.parse(readFileSync(join(ROOT, "content/image-map.json"), "utf8").replace(/^﻿/, ""));

// --- Candidate pool ---------------------------------------------------------
const candidates = Object.entries(TAGS)
  .filter(([, t]) => t && t.ok && !t.has_text && (t.quality === "high" || t.quality === "medium"))
  .map(([src, t]) => ({
    src,
    alt: (t.alt || t.caption || "Carpet And Duct Cleaning at work").slice(0, 120),
    services: t.services || [],
    kind: t.kind,
    quality: t.quality,
    orientation: t.orientation,
    w: t.w || 0,
    h: t.h || 0,
    hasPeople: !!t.has_people,
    bestFor: t.best_for || [],
  }));

const bySrc = new Map(candidates.map((c) => [c.src, c]));
const qualityScore = (c) => (c.quality === "high" ? 2 : 1);
const isLandscape = (c) => c.orientation === "landscape" || (c.w && c.h && c.w >= c.h);

// One global used-set across the whole manifest.
const used = new Set();

function scoreFor(c, { service, wantLandscape = true, wantPeople = null, kinds = null }) {
  let s = qualityScore(c) * 10;
  if (service) {
    if (c.services.includes(service)) s += 100;
    else if (c.services.length) s -= 60; // clearly depicts a different service
  }
  if (wantLandscape) s += isLandscape(c) ? 8 : -6;
  if (wantPeople != null) s += c.hasPeople === wantPeople ? 4 : -2;
  if (kinds && kinds.includes(c.kind)) s += 6;
  if (wantLandscape && c.bestFor.includes("hero")) s += 4;
  return s;
}

// Pick the best unused photo that depicts `service`. If requireMatch, only
// consider photos the vision model tagged with that service.
function pick({ service = null, wantLandscape = true, wantPeople = null, kinds = null, requireMatch = true }) {
  const pool = candidates
    .filter((c) => !used.has(c.src))
    .filter((c) => !requireMatch || !service || c.services.includes(service))
    .map((c) => ({ c, s: scoreFor(c, { service, wantLandscape, wantPeople, kinds }) }))
    .sort((a, b) => b.s - a.s);
  const chosen = pool[0]?.c || null;
  if (chosen) used.add(chosen.src);
  return chosen;
}

// Reserve the curated picks so the auto-fill never reuses them.
for (const a of OLD.assets || []) used.add(a.src);
for (const s of OLD.services || []) used.add(s.src);
for (const g of OLD.gallery || []) used.add(g.src);

// --- Services ---------------------------------------------------------------
// Keep the curated service photo when it exists and is a real photo; otherwise
// fill from vision tags. A curated pick is "weak" if its source was never
// tagged usable (e.g. it had baked-in text or was a graphic).
const serviceSlugs = URL_MAP.serviceHubs.map((h) => h.route.replace(/^\//, ""));
const oldServiceSrc = Object.fromEntries((OLD.services || []).map((s) => [s.slug, s]));
const services = [];
for (const s of serviceSlugs) {
  const old = oldServiceSrc[s];
  const oldTag = old && bySrc.get(old.src);
  const oldUsable = oldTag && oldTag.ok && !oldTag.has_text;
  if (old && oldUsable) {
    services.push(old);
    continue;
  }
  const fill = pick({ service: s, wantLandscape: true, kinds: ["work", "equipment", "result"] });
  if (fill) services.push({ slug: s, src: fill.src, alt: fill.alt });
  else if (old) services.push(old); // last resort: keep the curated pick anyway
}

// --- City pools -------------------------------------------------------------
const cityServices = [...new Set(URL_MAP.cityPages.map((c) => c.route.split("/")[1]))];
const cityPool = {};
for (const svc of cityServices) {
  const n = URL_MAP.cityPages.filter((c) => c.route.split("/")[1] === svc).length;
  const srcs = [];
  for (let i = 0; i < n + 4; i++) {
    const p = pick({ service: svc, wantLandscape: true, kinds: ["work", "result", "equipment"] });
    if (!p) break;
    srcs.push(p.src);
  }
  // If the service ran dry, top up with generic clean-interior shots.
  if (srcs.length < n) {
    for (let i = srcs.length; i < n; i++) {
      const p = pick({ service: null, wantLandscape: true, kinds: ["result", "work"], requireMatch: false });
      if (!p) break;
      srcs.push(p.src);
    }
  }
  cityPool[svc] = [...new Set(srcs)];
}

// --- Gallery ----------------------------------------------------------------
const gallery = [];
for (let i = 0; i < 12; i++) {
  const p = pick({ service: null, wantLandscape: false, kinds: ["work", "result", "equipment"], requireMatch: false });
  if (!p) break;
  gallery.push({ key: `job-${String(i + 1).padStart(2, "0")}`, src: p.src, w: 800, alt: p.alt });
}

// --- Assets -----------------------------------------------------------------
// Keep every curated asset (brand, heroes, scenes, and the named city picks
// that cityExact references). Auto-fill only keys that are still missing.
const assets = [...(OLD.assets || [])];
const haveKey = new Set(assets.map((a) => a.key));
function fillAsset(key, opts) {
  if (haveKey.has(key)) return;
  const p = pick(opts);
  if (p) assets.push({ key, src: p.src, w: opts.wantLandscape === false ? 1200 : 1600, alt: p.alt });
}
fillAsset("hero-home", { service: "carpet-cleaning", wantPeople: false, kinds: ["result", "work"] });
fillAsset("hero-about", { service: null, wantPeople: true, kinds: ["team", "vehicle", "work"], requireMatch: false });
fillAsset("duct-work", { service: "air-duct-cleaning", kinds: ["work", "equipment"] });
fillAsset("process-book", { service: null, wantPeople: true, kinds: ["team", "work"], requireMatch: false });
fillAsset("process-inspect", { service: "carpet-cleaning", wantPeople: true, kinds: ["work"] });
fillAsset("process-clean", { service: "carpet-cleaning", kinds: ["work", "equipment"] });
fillAsset("process-dry", { service: "carpet-cleaning", kinds: ["result", "equipment"] });

const out = {
  note: "Curated brand/hero/service picks preserved; city pools, gallery, and gaps auto-filled from content/photo-tags.json. src is relative to media/webp/.",
  generatedAt: new Date().toISOString(),
  assets,
  services,
  gallery,
  cityExact: OLD.cityExact || {},
  cityPool,
};

writeFileSync(join(ROOT, "content/image-map.json"), JSON.stringify(out, null, 2));
console.log(`services: ${services.length}/${serviceSlugs.length} (${services.filter((s) => bySrc.get(s.src)?.ok).length} vision-confirmed)`);
console.log(`gallery: ${gallery.length}, assets: ${assets.length}`);
for (const [svc, pool] of Object.entries(cityPool)) console.log(`cityPool ${svc}: ${pool.length}`);
