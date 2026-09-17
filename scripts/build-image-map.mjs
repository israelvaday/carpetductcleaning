/**
 * Build content/image-map.json from the vision tags in content/photo-tags.json.
 *
 * HARD RULE: no photo appears in two places. Every slot — service hero, service
 * card, related-services card, quote-picker tile, city hero, city job photos,
 * blog post image, gallery entry — gets its own unique photo, enforced by one
 * global used-set.
 *
 * Schema:
 *   assets:   [{ key, src, w, alt }]              brand/heroes/process/truck
 *   services: [{ slug, hero, card, related, picker, alt }]  all unique per role
 *   cityExact:{ "service/city": src }             unique hero per city
 *   cityJobs: { "service/city": [src,src,src] }   unique job photos per city
 *   posts:    { "post-slug": src }                unique image per post
 *   gallery:  [{ key, src, w, alt }]              homepage/about gallery only
 *
 * Usage: node scripts/build-image-map.mjs
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TAGS = JSON.parse(readFileSync(join(ROOT, "content/photo-tags.json"), "utf8").replace(/^﻿/, ""));
const URL_MAP = JSON.parse(readFileSync(join(ROOT, "audit/next-url-map.json"), "utf8").replace(/^﻿/, ""));
const OLD = JSON.parse(readFileSync(join(ROOT, "content/image-map.json"), "utf8").replace(/^﻿/, ""));

// --- Candidate pool ---------------------------------------------------------
// srcToKey must match lib/images.ts / copy-public-images.mjs. WordPress kept
// the same photo under name.webp AND name.png.webp — those collapse to one
// output file, so the pool must be deduped by that key or the "same" photo
// gets assigned twice under two paths.
function srcToKey(src) {
  return src
    .replace(/\.(jpg|jpeg|png|gif)\.webp$/i, "")
    .replace(/\.(webp|png|jpe?g|gif|avif)$/i, "")
    .split("/")
    .pop()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const seenKeys = new Set();
const candidates = [];
for (const [src, t] of Object.entries(TAGS)) {
  if (!t || !t.ok || t.has_text || (t.quality !== "high" && t.quality !== "medium")) continue;
  const key = srcToKey(src);
  if (seenKeys.has(key)) continue; // duplicate upload under a variant filename
  seenKeys.add(key);
  candidates.push({
    src,
    key,
    alt: (t.alt || t.caption || "Carpet And Duct Cleaning at work").slice(0, 120),
    services: t.services || [],
    kind: t.kind,
    quality: t.quality,
    orientation: t.orientation,
    w: t.w || 0,
    h: t.h || 0,
    hasPeople: !!t.has_people,
    bestFor: t.best_for || [],
  });
}

const bySrc = new Map(candidates.map((c) => [c.src, c]));
const qualityScore = (c) => (c.quality === "high" ? 2 : 1);
const isLandscape = (c) => c.orientation === "landscape" || (c.w && c.h && c.w >= c.h);

// Some hub slugs never appear in the vision tags (the tagger used plainer
// names). Map each hub to the tag services that are visually correct for it,
// so e.g. encapsulation-carpet-cleaning can match carpet-tagged photos.
const SERVICE_ALIASES = {
  "encapsulation-carpet-cleaning": ["carpet-cleaning"],
  "rug-pickup": ["area-rug-cleaning", "oriental-rug-cleaning"],
  "microfiber-couch-cleaning": ["couch-cleaning", "upholstery-cleaning"],
  "commercial-air-duct-cleaning": ["air-duct-cleaning"],
  commercial: ["commercial-carpet-cleaning", "carpet-cleaning"],
  "emergency-cleaning": ["water-damage-restoration", "carpet-cleaning"],
  "floor-cleaning": ["hardwood-floor-cleaning", "vinyl-floor-cleaning", "tile-and-grout-cleaning"],
  "couch-sectional-cleaning": ["couch-cleaning", "upholstery-cleaning"],
  "drape-curtain-cleaning": ["drape-cleaning", "upholstery-cleaning"],
};

// When a service's own pool runs dry, borrow from visually adjacent services
// (soft furnishings look right on a carpet page; hard floors on a wood page)
// instead of grabbing a random mismatched photo like ducts or travertine.
const RELATED_SERVICES = {
  "carpet-cleaning": ["area-rug-cleaning", "upholstery-cleaning", "couch-cleaning"],
  "air-duct-cleaning": ["dryer-vent-cleaning"],
  "dryer-vent-cleaning": ["air-duct-cleaning"],
  "area-rug-cleaning": ["oriental-rug-cleaning", "carpet-cleaning"],
  "oriental-rug-cleaning": ["area-rug-cleaning", "carpet-cleaning"],
  "upholstery-cleaning": ["couch-cleaning", "carpet-cleaning", "leather-furniture-cleaning"],
  "couch-cleaning": ["upholstery-cleaning", "carpet-cleaning"],
  "leather-furniture-cleaning": ["upholstery-cleaning", "couch-cleaning"],
  "hardwood-floor-cleaning": ["vinyl-floor-cleaning", "tile-and-grout-cleaning", "natural-stone-cleaning"],
  "vinyl-floor-cleaning": ["hardwood-floor-cleaning", "tile-and-grout-cleaning"],
  "tile-and-grout-cleaning": ["natural-stone-cleaning", "hardwood-floor-cleaning", "vinyl-floor-cleaning"],
  "natural-stone-cleaning": ["tile-and-grout-cleaning", "hardwood-floor-cleaning"],
  "water-damage-restoration": ["carpet-cleaning"],
  "pet-stain-odor": ["carpet-cleaning", "upholstery-cleaning"],
  "outdoor-furniture-cleaning": ["upholstery-cleaning"],
  "car-seat-cleaning": ["upholstery-cleaning", "couch-cleaning"],
  "drape-cleaning": ["upholstery-cleaning"],
  "commercial-carpet-cleaning": ["carpet-cleaning"],
};

function matchServices(service) {
  if (!service) return [];
  return [service, ...(SERVICE_ALIASES[service] || [])];
}

function relatedServices(service) {
  if (!service) return [];
  const direct = RELATED_SERVICES[service] || [];
  const viaAlias = (SERVICE_ALIASES[service] || []).flatMap((a) => RELATED_SERVICES[a] || []);
  return [...new Set([...direct, ...viaAlias])];
}

// One global used-set across the whole manifest — the hard rule. Keyed by the
// output filename so duplicate uploads (name.webp vs name.png.webp) collide.
const used = new Set();

function scoreFor(c, { service, wantLandscape = true, wantPeople = null, kinds = null }) {
  let s = qualityScore(c) * 10;
  if (service) {
    if (matchServices(service).some((m) => c.services.includes(m))) s += 100;
    else if (relatedServices(service).some((r) => c.services.includes(r))) s += 35;
    else if (c.services.length) s -= 60;
  }
  if (wantLandscape) s += isLandscape(c) ? 8 : -6;
  if (wantPeople != null) s += c.hasPeople === wantPeople ? 4 : -2;
  if (kinds && kinds.includes(c.kind)) s += 6;
  if (wantLandscape && c.bestFor.includes("hero")) s += 4;
  return s;
}

function pick({ service = null, wantLandscape = true, wantPeople = null, kinds = null, requireMatch = false }) {
  const match = matchServices(service);
  const pool = candidates
    .filter((c) => !used.has(c.key))
    .filter((c) => !requireMatch || !service || match.some((m) => c.services.includes(m)))
    .map((c) => ({ c, s: scoreFor(c, { service, wantLandscape, wantPeople, kinds }) }))
    .sort((a, b) => b.s - a.s);
  const chosen = pool[0]?.c || null;
  if (chosen) used.add(chosen.key);
  return chosen;
}

// Curated assets — hardcoded so rebuilds are stable (this script reads its own
// output as OLD, so anything not listed here would be lost on the next run).
// Each is referenced on exactly ONE page; logo/badges are brand chrome.
const CURATED_ASSETS = [
  ["logo", "2025/08/logo_02.webp", 440, "Carpet And Duct Cleaning logo"],
  ["google", "2025/08/1680966838337.webp", 260, "Google Guaranteed badge"],
  ["bbb", "2025/08/bbb-logo.webp", 260, "BBB Accredited Business A+ rating"],
  // Homepage
  ["hero-home", "generated/hero-home.png", 1600, "Bright Orange County living room with freshly cleaned carpet and professional cleaning equipment"],
  ["process-book", "generated/process-book.png", 1200, "Cleaning technician greeting a homeowner at the front door"],
  ["process-inspect", "generated/process-inspect.png", 1200, "Technician using a moisture meter on carpet before cleaning"],
  ["process-clean", "generated/process-clean.png", 1200, "Hot-water extraction wand leaving a clean stripe on carpet"],
  ["process-dry", "generated/process-dry.png", 1200, "Air mover drying a freshly cleaned carpet in a bright living room"],
  ["van", "2026/02/carpet-and-duct-cleaning-van.webp", 1200, "Carpet And Duct Cleaning service van in Irvine, CA"],
  ["tech", "2025/11/Technician-carefully-treating-a-carpet-stain-using-professional-tools.webp", 1200, "Technician treating a carpet stain with professional tools"],
  ["carpet-family", "2025/08/happy-family-relaxing-in-a-clean-living-room.webp", 1200, "Family relaxing on a freshly cleaned carpet"],
  ["carpet-stains", "2025/09/stained-vs.-cleaned-carpet.webp", 1200, "Carpet before and after professional stain removal"],
  ["duct-work", "2025/08/HVAC-doesnt-have-to-overwork.webp", 1200, "Air duct before and after HEPA cleaning"],
  // Contact / blog heroes
  ["carpet-room", "2026/03/bright-bedroom-with-freshly-cleaned-carpet.webp", 1600, "Bright bedroom with freshly cleaned carpet"],
  ["carpet-protect", "2025/10/applying-stain-protection-spray-on-clean-carpet.webp", 1600, "Technician applying carpet protector to clean carpet fibers"],
  // About
  ["hero-about", "2025/08/11.webp", 1600, "A Carpet And Duct Cleaning team member"],
  ["truck-mount", "2025/11/Truck-mounted-extraction-hose-connected-to-a-home-illustrating-professional-grade-cleaning-power.webp", 1200, "Truck-mounted extraction hose running into an Orange County home"],
  // Locations hero
  ["truck", "2025/11/Cleaning-compant-truck.webp", 1600, "Carpet & Duct Cleaning truck-mounted rig connected to an Orange County home"],
];
const assets = CURATED_ASSETS.map(([key, src, w, alt]) => ({ key, src, w, alt }));
for (const a of assets) used.add(srcToKey(a.src));

// about-crew: a second people/work photo, unique to /about.
{
  const p = pick({ service: null, wantPeople: true, kinds: ["team", "work"], requireMatch: false });
  if (p) assets.push({ key: "about-crew", src: p.src, w: 1600, alt: p.alt });
}

// --- Services: unique photo per role ----------------------------------------
// hero = hub page, card = homepage grid, steps = 4 process-wizard panels on
// the hub. picker = quote-wizard tile, but only for the 8 money services the
// homepage wizard shows (the library can't sustain a picker for all 25).
// Must match SERVICES in components/quote-wizard.tsx exactly — any service the
// wizard can render needs its own picker photo or it falls back to the hero.
const MONEY_SERVICES = new Set([
  "carpet-cleaning",
  "air-duct-cleaning",
  "dryer-vent-cleaning",
  "water-damage-restoration",
  "area-rug-cleaning",
  "upholstery-cleaning",
  "hardwood-floor-cleaning",
  "commercial-carpet-cleaning",
  "tile-and-grout-cleaning",
]);
const serviceSlugs = URL_MAP.serviceHubs.map((h) => h.route.replace(/^\//, ""));
const services = [];
for (const slug of serviceSlugs) {
  const hero = pick({ service: slug, wantLandscape: true, kinds: ["work", "equipment", "result"] });
  const card = pick({ service: slug, wantLandscape: true, kinds: ["work", "result", "equipment"] });
  const picker = MONEY_SERVICES.has(slug)
    ? pick({ service: slug, wantLandscape: true, kinds: ["work", "result", "equipment"] })
    : null;
  const steps = [];
  for (let i = 0; i < 4; i++) {
    const p = pick({ service: slug, wantLandscape: true, kinds: ["work", "equipment", "result"] });
    if (!p) break;
    steps.push(p.src);
  }
  const best = hero || card || picker;
  services.push({
    slug,
    hero: hero?.src || null,
    card: card?.src || null,
    picker: picker?.src || null,
    steps,
    alt: best?.alt || `Professional ${slug.replaceAll("-", " ")} in Orange County`,
  });
}

// --- Cities: unique hero + 2 unique job photos each ---------------------------
// hero = the city page hero, jobs = the "recent work" strip on the city page.
// The /locations tile is NOT a work photo — it is a generated city landmark
// (see cityLandmarks below), so the work pool only has to cover the pages
// where the work itself is the subject.
const cityExact = {};
const cityJobs = {};
for (const page of URL_MAP.cityPages) {
  const [, service, city] = page.route.split("/");
  const key = `${service}/${city}`;
  const hero = pick({ service, wantLandscape: true, kinds: ["work", "result", "equipment"] });
  if (hero) cityExact[key] = hero.src;
  const jobs = [];
  for (let i = 0; i < 2; i++) {
    const p = pick({ service, wantLandscape: false, kinds: ["work", "result", "equipment"] });
    if (!p) break;
    jobs.push(p.src);
  }
  if (jobs.length) cityJobs[key] = jobs;
}

// --- City landmarks: one generated photo per city for the /locations grid ----
// Produced by scripts/generate-city-photos.mjs into media/generated/. Keyed by
// city slug only — a city looks the same no matter which service you need.
const cityLandmarks = {};
{
  const titleCase = (s) => s.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
  const cities = [...new Set(URL_MAP.cityPages.map((p) => p.route.split("/")[2]))];
  for (const city of cities) {
    const src = `generated/city-${city}.png`;
    if (existsSync(join(ROOT, "media/generated", `city-${city}.png`))) {
      cityLandmarks[city] = { src, alt: `${titleCase(city)}, California` };
    }
  }
}

// --- Blog posts: unique image each, matched by topic ------------------------
const POST_RULES = [
  [/dryer|lint/i, "dryer-vent-cleaning"],
  [/duct|vent|air.quality|allerg|hvac/i, "air-duct-cleaning"],
  [/water|flood|restoration/i, "water-damage-restoration"],
  [/oriental|persian|wool/i, "oriental-rug-cleaning"],
  [/rug/i, "area-rug-cleaning"],
  [/upholster|sofa|couch|mattress|fabric/i, "upholstery-cleaning"],
  [/hardwood|wood.floor/i, "hardwood-floor-cleaning"],
  [/tile|grout/i, "tile-and-grout-cleaning"],
  [/vinyl/i, "vinyl-floor-cleaning"],
  [/marble|stone|travertine/i, "natural-stone-cleaning"],
  [/pet|odor|urine/i, "pet-stain-odor"],
  [/curtain|drape/i, "drape-cleaning"],
  [/outdoor|patio/i, "outdoor-furniture-cleaning"],
  [/car|rv|vehicle|auto/i, "car-seat-cleaning"],
  [/commercial|office|hotel|property/i, "commercial-carpet-cleaning"],
  [/leather/i, "leather-furniture-cleaning"],
  [/microfiber/i, "microfiber-couch-cleaning"],
];
const postSlugs = readdirSync(join(ROOT, "content/posts"))
  .filter((f) => f.endsWith(".json"))
  .map((f) => f.replace(/\.json$/, ""));
const posts = {};
for (const slug of postSlugs) {
  let svc = null; // no topic match → generic pick, don't drain the carpet pool
  for (const [re, s] of POST_RULES) if (re.test(slug)) { svc = s; break; }
  const p = pick({ service: svc, wantLandscape: true, kinds: ["work", "result", "equipment"] });
  if (p) posts[slug] = p.src;
}

// --- Gallery: 16 unique mixed shots (home and about take disjoint halves) ----
const gallery = [];
for (let i = 0; i < 16; i++) {
  const p = pick({ service: null, wantLandscape: false, kinds: ["work", "result", "equipment"], requireMatch: false });
  if (!p) break;
  gallery.push({ key: `job-${String(i + 1).padStart(2, "0")}`, src: p.src, w: 800, alt: p.alt });
}

const out = {
  note: "HARD RULE: every slot gets a unique photo (global used-set). src is relative to media/webp/.",
  generatedAt: new Date().toISOString(),
  assets,
  services,
  cityExact,
  cityLandmarks,
  cityJobs,
  posts,
  gallery,
};

writeFileSync(join(ROOT, "content/image-map.json"), JSON.stringify(out, null, 2));

const missing = services.filter((s) => !s.hero || !s.card || s.steps.length < 4);
console.log(`assets: ${assets.length}`);
console.log(`services: ${services.length} (${missing.length} with unfilled roles${missing.length ? ": " + missing.map((s) => s.slug).join(", ") : ""})`);
console.log(`cityExact: ${Object.keys(cityExact).length}/${URL_MAP.cityPages.length}, cityLandmarks: ${Object.keys(cityLandmarks).length}, cityJobs: ${Object.keys(cityJobs).length}`);
console.log(`posts: ${Object.keys(posts).length}/${postSlugs.length}, gallery: ${gallery.length}`);
console.log(`unique photos assigned: ${used.size}`);
