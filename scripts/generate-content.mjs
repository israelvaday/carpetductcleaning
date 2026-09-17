/**
 * Generate unique, SEO-clean content for every page via OpenRouter.
 *
 * Produces content/generated/{services,cities,blog,meta}.json which
 * lib/content.ts merges over the raw WordPress dump. Nothing here invents
 * credentials, awards, or ratings — only what lib/site.ts already states.
 *
 * Usage:
 *   node scripts/generate-content.mjs            # everything, skip existing
 *   node scripts/generate-content.mjs --cities   # only cities
 *   node scripts/generate-content.mjs --force    # regenerate even if present
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chatJson, getKey, loadEnvLocal, pool, sleep } from "./or-lib.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "content/generated");
mkdirSync(OUT_DIR, { recursive: true });

const URL_MAP = JSON.parse(readFileSync(join(ROOT, "audit/next-url-map.json"), "utf8"));
const MODEL = process.env.OPENROUTER_CHAT_MODEL || "google/gemini-2.5-flash";

const BIZ = "Carpet And Duct Cleaning";
const PHONE = "(949) 992-3299";
const FOUNDED = 2013;
const REGION = "Orange County, CA";
const BASE = "Irvine, CA";

const FACTS = `Established facts (use only these, never invent new ones):
- ${BIZ}, based in ${BASE}, serving ${REGION} since ${FOUNDED}.
- Phone ${PHONE}. IICRC-certified technicians. Google Guaranteed. BBB A+ rating.
- EPA Safer Choice products, safe for kids and pets. Same-day and next-day openings.
- Truck-mounted hot-water extraction for carpet; HEPA negative-air for ducts.
HARD RULES: No superlatives (no "best", "#1", "top-rated", "premier", "most trusted", "5-star"). No made-up licenses, awards, review counts, or prices beyond a general range. No competitor names. No URLs. Natural, plain, confident contractor voice. Vary sentence openings. Never start two paragraphs the same way.`;

const SERVICE_NAME = Object.fromEntries(
  URL_MAP.serviceHubs.map((h) => {
    const s = h.route.replace(/^\//, "");
    return [s, s.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ")];
  }),
);
// Nicer display names for a few.
Object.assign(SERVICE_NAME, {
  "rug-pickup": "Rug Pickup & Drop-Off",
  "pet-stain-odor": "Pet Stain & Odor Treatment",
  commercial: "Commercial Cleaning",
});

const args = process.argv.slice(2);
const FORCE = args.includes("--force");
const ONLY = ["--services", "--cities", "--blog", "--meta"].find((a) => args.includes(a));
const run = (flag) => !ONLY || ONLY === flag;

function loadOut(name) {
  const p = join(OUT_DIR, name);
  return existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : {};
}
function saveOut(name, data) {
  writeFileSync(join(OUT_DIR, name), JSON.stringify(data, null, 2));
}

// --- Services ---------------------------------------------------------------
async function genServices(key) {
  const existing = loadOut("services.json");
  const todo = URL_MAP.serviceHubs
    .map((h) => h.route.replace(/^\//, ""))
    .filter((s) => FORCE || !existing[s]);
  if (!todo.length) return console.log("services: up to date");
  console.log(`services: generating ${todo.length}`);

  const system = `You write original SEO service-page copy for ${BIZ}. ${FACTS}
Return strict JSON keyed by service slug. Each value:
{
  "tagline": "max 14 words, no superlatives",
  "description": "2-3 sentences for the page intro",
  "paragraphs": ["3-4 unique paragraphs, 40-70 words each, about method, what is included, and who it is for"],
  "bullets": ["5 concise included-on-every-job items"],
  "keywords": ["6 lowercase local search phrases"]
}
Make each service distinct — do not reuse phrasing across services.`;

  // Batches of 6 keep responses well-formed.
  for (let i = 0; i < todo.length; i += 6) {
    const batch = todo.slice(i, i + 6);
    const user = JSON.stringify(batch.map((s) => ({ slug: s, name: SERVICE_NAME[s] })));
    const out = await chatJson(key, MODEL, system, user, 0.7);
    for (const s of batch) if (out[s]) existing[s] = out[s];
    saveOut("services.json", existing);
    console.log(`  services ${Math.min(i + 6, todo.length)}/${todo.length}`);
    await sleep(700);
  }
}

// --- Cities -----------------------------------------------------------------
async function genCities(key) {
  const existing = loadOut("cities.json");
  const pages = URL_MAP.cityPages.map((c) => {
    const [, service, city] = c.route.split("/");
    return { service, city, route: c.route };
  });
  const todo = pages.filter((p) => FORCE || !existing[`${p.service}/${p.city}`]);
  if (!todo.length) return console.log("cities: up to date");
  console.log(`cities: generating ${todo.length} unique service+city pages`);

  const system = `You write unique local SEO copy for ${BIZ}. ${FACTS}
For each service+city pair return strict JSON keyed by "service/city":
{
  "intro": "1-2 sentences naming the service and city naturally",
  "localAngle": "2-3 sentences of REAL, specific local relevance: the city's housing stock, climate, environment, or lifestyle that affects this cleaning need. Be accurate to that specific Orange County city — coastal vs inland, older vs new construction, dust, humidity, hard water, etc.",
  "paragraphs": ["2-3 unique paragraphs, 45-75 words each, combining the service method with the local angle"],
  "faqs": [{"q": "question specific to this service in this city", "a": "2-3 sentence answer"}],
  "keywords": ["5 lowercase local phrases like 'carpet cleaning <city>'"]
}
Every city must read differently. Reference that city's real character. 3 FAQs each.`;

  for (let i = 0; i < todo.length; i += 4) {
    const batch = todo.slice(i, i + 4);
    const user = JSON.stringify(
      batch.map((p) => ({
        key: `${p.service}/${p.city}`,
        service: SERVICE_NAME[p.service] || p.service,
        city: p.city.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" "),
      })),
    );
    try {
      const out = await chatJson(key, MODEL, system, user, 0.75);
      // The model sometimes returns an array or uses different key casing, so
      // normalize: build a lowercase map and also accept positional values.
      const values = Array.isArray(out) ? out : Object.values(out);
      const byLower = new Map(
        Object.entries(out && !Array.isArray(out) ? out : {}).map(([k, v]) => [k.toLowerCase(), v]),
      );
      batch.forEach((p, idx) => {
        const k = `${p.service}/${p.city}`;
        const hit =
          out[k] ||
          byLower.get(k.toLowerCase()) ||
          byLower.get(p.city.toLowerCase()) ||
          values[idx];
        if (hit && (hit.paragraphs || hit.localAngle || hit.intro)) existing[k] = hit;
      });
      saveOut("cities.json", existing);
      console.log(`  cities ${Math.min(i + 4, todo.length)}/${todo.length} (stored ${Object.keys(existing).length})`);
    } catch (e) {
      console.log(`  batch error at ${i}: ${e.message}`);
    }
    await sleep(700);
  }
}

// --- Blog -------------------------------------------------------------------
async function genBlog(key) {
  const dir = join(ROOT, "content/posts");
  const { readdirSync } = await import("node:fs");
  const posts = readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => f.replace(/\.json$/, ""));
  const existing = loadOut("blog.json");
  const todo = posts.filter((s) => FORCE || !existing[s]);
  if (!todo.length) return console.log("blog: up to date");
  console.log(`blog: generating metadata for ${todo.length} posts`);

  const system = `You write SEO blog metadata for ${BIZ}. ${FACTS}
Return strict JSON keyed by slug. Each: { "title": "compelling post title, no superlatives", "excerpt": "1-2 sentence hook", "category": "Carpet|Air Duct|Rugs|Upholstery|Floors|Water Damage|Tips", "readMinutes": 5-8, "heroAlt": "accessible hero image alt" }. Keep the slug's topic.`;
  for (let i = 0; i < todo.length; i += 8) {
    const batch = todo.slice(i, i + 8);
    try {
      const out = await chatJson(key, MODEL, system, JSON.stringify(batch), 0.65);
      for (const s of batch) if (out[s]) existing[s] = out[s];
      saveOut("blog.json", existing);
      console.log(`  blog ${Math.min(i + 8, todo.length)}/${todo.length}`);
    } catch (e) {
      console.log(`  blog batch error: ${e.message}`);
    }
    await sleep(700);
  }
}

// --- Meta / homepage --------------------------------------------------------
async function genMeta(key) {
  const system = `Write unique SEO metadata for ${BIZ}, ${BASE}, phone ${PHONE}, serving ${REGION} since ${FOUNDED}. ${FACTS}
Return strict JSON: { "tagline": "max 14 words", "homepageTitle": "50-60 chars", "homepageDescription": "140-155 chars", "aboutBlurb": "2 sentences", "footerBlurb": "2 sentences" }. Mention Irvine / Orange County naturally.`;
  const meta = await chatJson(key, MODEL, system, "Generate metadata.", 0.55);
  saveOut("meta.json", meta);
  console.log("meta: done");
}

loadEnvLocal();
const key = getKey();
if (!key) throw new Error("OPENROUTER_API_KEY missing");

if (run("--services")) await genServices(key);
if (run("--cities")) await genCities(key);
if (run("--blog")) await genBlog(key);
if (run("--meta")) await genMeta(key);
console.log("Content generation complete.");
