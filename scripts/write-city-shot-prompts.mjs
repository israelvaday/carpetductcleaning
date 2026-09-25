/**
 * Ask OpenRouter for a different carpet-cleaning photo prompt per city,
 * then (with --images) generate media/generated/city-service-<slug>.png.
 *
 *   node scripts/write-city-shot-prompts.mjs
 *   node scripts/write-city-shot-prompts.mjs --images
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chatJson, generateImage, getKey, loadEnvLocal, sleep } from "./or-lib.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PROMPTS = join(ROOT, "content/city-service-prompts.json");
const OUT = join(ROOT, "media/generated");

const CITIES = {
  "aliso-viejo": "Coastal sage hills and canyon trails around Aliso Viejo",
  anaheim: "Palm-lined suburban boulevard in Anaheim",
  "anaheim-hills": "Hillside stucco homes in Anaheim Hills at dusk",
  "buena-park": "Quiet street of single-story homes and tall palms in Buena Park",
  "corona-del-mar": "Coastal bluff houses above a cove in Corona del Mar",
  "costa-mesa": "Low modern houses near a wide suburban street in Costa Mesa",
  "coto-de-caza": "Gated hillside estate with oaks in Coto de Caza",
  "dana-point": "Harbor-town house with sailboat masts in the far distance, Dana Point",
  "dove-canyon": "Golf-course edge homes among rolling hills in Dove Canyon",
  "east-irvine": "New tract homes around a green neighborhood park in East Irvine",
  "foothill-ranch": "Houses beside a small suburban lake in Foothill Ranch",
  "fountain-valley": "Flat suburban lawns and a park lake in Fountain Valley",
  fullerton: "Older craftsman house on a brick-downtown-adjacent street in Fullerton",
  "garden-grove": "Jacaranda trees over a ranch house in Garden Grove",
  "huntington-beach": "Beach-city bungalow, ocean and pier only as a distant backdrop, Huntington Beach",
  irvine: "Master-planned Irvine home, palms outside, a ferris wheel tiny in the far distance",
  "ladera-ranch": "Red-tile roofs and a water tower far behind a village house in Ladera Ranch",
  "laguna-beach": "House on a cliff street, turquoise cove only glimpsed past the roof, Laguna Beach",
  "laguna-hills": "Hillside two-story homes in Laguna Hills",
  "santa-ana": "Older downtown-adjacent bungalow in Santa Ana",
  "seal-beach": "Small beach cottage a few blocks from a wooden pier, Seal Beach",
  stanton: "Modest one-story homes and palms in Stanton",
  "trabuco-canyon": "Rural oak canyon property with a long driveway in Trabuco Canyon",
  tustin: "Old-town bungalow with a front porch in Tustin",
  "tustin-ranch": "Upscale golf-course house in Tustin Ranch",
  westminster: "Tight suburban lot with palms in Westminster",
  woodbridge: "House beside a village lake and a wooden footbridge in Woodbridge, Irvine",
  "yorba-linda": "Horse-country hills and white rail fence in Yorba Linda",
};

const SHOTS = [
  "service van in the driveway, rear doors open, hose running to the front door, no person",
  "truck-mounted cleaning machine at the curb, hoses across the lawn, technician seen small at the truck",
  "technician kneeling to treat a pet stain, tight framing, face not toward camera",
  "technician on the porch handing a tablet to a homeowner in the doorway",
  "only the extraction wand and a clean stripe on the carpet, boots at the edge, no face",
  "technician walking up the front path with the wand over one shoulder",
  "view from inside the open cargo van looking out at the house",
  "two people carrying a rolled area rug toward the van",
  "blue air mover on a damp carpet, technician blurred in the background",
  "gloved hands pressing a moisture meter into the carpet, no face",
  "technician coiling a blue hose on the side of the house",
  "bedroom with furniture up on sliders, technician working with their back to us",
  "staircase carpet, low angle, wand coming down the stairs",
  "garage door up, machine and hoses staged inside, person at the truck outside",
  "technician sitting on the van tailgate between rooms, candid, not posing",
  "tight crop of the hose coupler on the truck, house soft behind it",
  "over-the-shoulder of a technician showing a stain to a standing homeowner",
  "evening job, work light on the porch, van in the dark driveway",
  "second-story view looking down at the van and the front walk",
  "crew member wiping a light-colored sofa, carpet already striped behind them",
  "side yard, technician dragging the hose around a corner of the house",
  "close three-quarter of the wand head only, room and window behind",
  "van parked on the street, technician unloading a wand, different house style",
  "patio of the house, equipment cases open, ocean or hills only at the edge of frame",
  "apartment walkway, technician with a hose outside a unit door",
  "long rural driveway, truck small in the distance, oaks overhead",
  "technician at the open front door, interior carpet visible, exterior street behind",
  "macro of carpet fibers, half cleaned, a window with the local landscape out of focus",
];

loadEnvLocal();
const key = getKey();
if (!key) throw new Error("OPENROUTER_API_KEY missing");

const slugs = Object.keys(CITIES);
if (slugs.length !== SHOTS.length) throw new Error(`Need ${slugs.length} shots, have ${SHOTS.length}`);

async function writePrompts() {
  const system = `You write image-generation prompts for a carpet cleaning company in Orange County, California.
Return JSON: {"shots":[{"slug":"...","shot":"...","prompt":"..."}]}
Rules:
- One object per city slug I give you. Use every slug once.
- Assign each city a DIFFERENT shot from the shot list. Use every shot once. Do not give two cities the same kind of photo.
- The cleaning work or the service vehicle is the subject. The city is only the setting (house style, street, a glimpse of landscape). Never a travel photo of a pier, beach, or skyline with no cleaning work.
- Vary where the person is: some shots have no person, some show only hands or boots, some show a technician from behind or the side. Never a row of identical men in the same pose.
- No text, logos, watermarks, signs with words, or anyone looking at the camera. Plain white or navy clothing, no company name on the van.
- Each prompt is 2 or 3 sentences a photo model can follow. Name the city.`;

  const user = JSON.stringify({
    cities: CITIES,
    shots: SHOTS,
    instruction: "Pair each city with exactly one shot. Write the prompt.",
  });

  const out = await chatJson(key, "google/gemini-2.5-flash", system, user, 0.9);
  const shots = out.shots || out;
  if (!Array.isArray(shots) || shots.length < slugs.length) {
    throw new Error(`Expected ${slugs.length} shots, got ${Array.isArray(shots) ? shots.length : typeof shots}`);
  }
  const bySlug = new Map(shots.map((s) => [s.slug, s]));
  const missing = slugs.filter((s) => !bySlug.get(s)?.prompt);
  if (missing.length) throw new Error(`Missing prompts: ${missing.join(", ")}`);
  const usedShots = shots.map((s) => String(s.shot || "").toLowerCase());
  const dupes = usedShots.filter((s, i) => usedShots.indexOf(s) !== i);
  if (dupes.length) console.log("warning: repeated shot labels:", [...new Set(dupes)].join(" | "));
  const ordered = slugs.map((slug) => bySlug.get(slug));
  writeFileSync(PROMPTS, JSON.stringify(ordered, null, 2));
  console.log(`wrote ${ordered.length} prompts to content/city-service-prompts.json`);
  for (const s of ordered) console.log(`- ${s.slug}: ${s.shot}`);
}

async function generate() {
  const shots = JSON.parse(readFileSync(PROMPTS, "utf8"));
  const style =
    "Documentary photo, true-to-life color, natural light, realistic textures, full-frame camera. No text, no logos, no watermark.";
  let n = 0;
  for (const s of shots) {
    const file = join(OUT, `city-service-${s.slug}.png`);
    try {
      const buf = await generateImage(key, `${s.prompt} ${style}`, {
        model: "openai/gpt-image-2.5-flare",
        aspect_ratio: "4:3",
        resolution: "1K",
        output_format: "png",
        quality: "high",
      });
      writeFileSync(file, buf);
      n++;
      console.log(`[${n}/${shots.length}] city-service-${s.slug}.png (${(buf.length / 1024).toFixed(0)} KB)`);
    } catch (e) {
      console.log(`FAILED ${s.slug}: ${e.message}`);
    }
    await sleep(800);
  }
  console.log("images done", n);
}

if (!existsSync(PROMPTS) || process.argv.includes("--rewrite")) await writePrompts();
else console.log("prompts exist, skipping rewrite (pass --rewrite to replace)");
if (process.argv.includes("--images")) await generate();
