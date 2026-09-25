/**
 * Read each blog post and ask OpenRouter for a photo prompt that matches
 * that article, then generate media/generated/blog-<slug>.png.
 *
 *   node scripts/write-blog-photo-prompts.mjs --rewrite
 *   node scripts/write-blog-photo-prompts.mjs --images
 */
import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chatJson, generateImage, getKey, loadEnvLocal, sleep } from "./or-lib.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PROMPTS = join(ROOT, "content/blog-photo-prompts.json");
const OUT = join(ROOT, "media/generated");
const POSTS = join(ROOT, "content/posts");

const SHOTS = [
  "tight crop of the tool doing the work, no face",
  "technician from behind, mid-job",
  "service van in a driveway, hose to the door, no person",
  "gloved hands only",
  "low angle along the floor",
  "looking out from inside the open van",
  "homeowner and technician at the doorway, neither looking at camera",
  "equipment staged, person small in the background",
  "close texture of the surface, half cleaned",
  "wide room after the work, one tool left in frame",
  "technician kneeling, side view",
  "stairs or a hallway, not a straight-on portrait",
  "outdoor side of the house, the relevant vent or furniture",
  "night or late-day job with a work light",
  "second-story or high angle looking down at the job",
  "macro of debris that the article is about, then the tool",
];

function excerpt(post) {
  const raw = String(post.text || post.seo?.description || post.title || "");
  return raw.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 700);
}

loadEnvLocal();
const key = getKey();
if (!key) throw new Error("OPENROUTER_API_KEY missing");

const posts = readdirSync(POSTS)
  .filter((f) => f.endsWith(".json"))
  .map((f) => JSON.parse(readFileSync(join(POSTS, f), "utf8")))
  .map((p, i) => ({
    slug: p.slug,
    title: p.title,
    shot: SHOTS[i % SHOTS.length],
    excerpt: excerpt(p),
  }));

async function writePrompts() {
  const system = `You write photo prompts for a carpet, rug, upholstery, and air-duct cleaning company in Orange County.
Return JSON: {"shots":[{"slug":"...","prompt":"..."}]}
Rules:
- One prompt per post. The picture must show the specific subject of THAT article (pet hair, dryer lint, grout, a mattress, outdoor cushions, a rug fringe, water on a floor, and so on). Do not make every post a man cleaning a living-room carpet.
- Use the assigned shot for that post so the photos are not the same pose.
- Documentary, real, imperfect, natural light. No text, logos, watermarks, or anyone looking at the camera.
- If the title names a city, the house or street should feel like that part of Orange County, but the job is the subject.
- 2 or 3 sentences.`;

  const all = [];
  const size = 11;
  for (let i = 0; i < posts.length; i += size) {
    const batch = posts.slice(i, i + size);
    const out = await chatJson(key, "google/gemini-2.5-flash", system, JSON.stringify(batch), 0.85);
    const shots = out.shots || out;
    if (!Array.isArray(shots)) throw new Error("Bad batch response");
    all.push(...shots);
    console.log(`batch ${i / size + 1}: ${shots.length}`);
  }
  const bySlug = new Map(all.map((s) => [s.slug, s]));
  const missing = posts.filter((p) => !bySlug.get(p.slug)?.prompt).map((p) => p.slug);
  if (missing.length) throw new Error(`Missing: ${missing.join(", ")}`);
  const ordered = posts.map((p) => ({ slug: p.slug, title: p.title, shot: p.shot, prompt: bySlug.get(p.slug).prompt }));
  writeFileSync(PROMPTS, JSON.stringify(ordered, null, 2));
  console.log(`wrote ${ordered.length} blog prompts`);
  for (const s of ordered) console.log(`- ${s.slug}: ${s.shot}`);
}

async function generate() {
  const shots = JSON.parse(readFileSync(PROMPTS, "utf8"));
  const style = "Photorealistic documentary photo, true-to-life color, natural light, real textures. No text, no logos, no watermark.";
  let n = 0;
  for (const s of shots) {
    const name = `blog-${s.slug}.png`;
    try {
      const buf = await generateImage(key, `${s.prompt} ${style}`, {
        model: "openai/gpt-image-2.5-flare",
        aspect_ratio: "16:9",
        resolution: "1K",
        output_format: "png",
        quality: "high",
      });
      writeFileSync(join(OUT, name), buf);
      n++;
      console.log(`[${n}/${shots.length}] ${name} (${(buf.length / 1024).toFixed(0)} KB)`);
    } catch (e) {
      console.log(`FAILED ${s.slug}: ${e.message}`);
    }
    await sleep(700);
  }
  console.log("images done", n);
}

if (!existsSync(PROMPTS) || process.argv.includes("--rewrite")) await writePrompts();
if (process.argv.includes("--images")) await generate();
