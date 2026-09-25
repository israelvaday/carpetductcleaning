/**
 * One new photo per service hub, plus a second photo for each homepage card.
 * Mid tier (gpt-image-2.5-flare). Skips files that already exist.
 *
 *   node scripts/generate-service-photos.mjs
 *   node scripts/generate-service-photos.mjs --force
 */
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { generateImage, getKey, loadEnvLocal, sleep } from "./or-lib.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "media/generated");
mkdirSync(OUT, { recursive: true });

const args = process.argv.slice(2);
const force = args.includes("--force");
const model = args.includes("--model") ? args[args.indexOf("--model") + 1] : "openai/gpt-image-2.5-flare";

const STYLE =
  "Documentary photo of a real job in an Orange County California home, true-to-life colors, natural light, " +
  "realistic textures, shot on a full-frame camera. No text, no words, no logos, no watermark, nobody looking at the camera.";

const SHOTS = [
  ["carpet-cleaning", "hero", "16:9", "Wide living room, truck-mounted hot-water wand leaving a clean stripe on light beige wall-to-wall carpet, hose in frame."],
  ["carpet-cleaning", "card", "4:3", "Close view of a stainless extraction wand head on plush beige carpet, cleaned path beside a soiled path, technician boots at the edge."],
  ["air-duct-cleaning", "hero", "16:9", "Technician in a navy polo using a HEPA vacuum hose on an open ceiling air-duct register in a hallway, dusty register beside a cleaned one."],
  ["air-duct-cleaning", "card", "4:3", "Close-up inside a rectangular galvanized air duct as a rotary brush and vacuum hose pull out gray dust."],
  ["dryer-vent-cleaning", "hero", "16:9", "Technician cleaning a white exterior dryer-vent hood on the side of a stucco house, lint coming out of the hood, hose from a service van."],
  ["dryer-vent-cleaning", "card", "4:3", "Handful of dryer lint removed from a vent pipe next to a clean metal vent tube on a garage floor."],
  ["water-damage-restoration", "hero", "16:9", "Living room after a leak: carpet pulled back, air movers and a dehumidifier running, technician checking moisture in the pad."],
  ["water-damage-restoration", "card", "4:3", "Two blue air movers aimed at a damp carpet edge and a moisture meter on the floor."],
  ["area-rug-cleaning", "hero", "16:9", "Large area rug spread on a wash floor, technician rinsing it with a wand, fringe visible, no text."],
  ["area-rug-cleaning", "card", "4:3", "Close-up of a wool area rug being groomed after washing, fibers standing up, wet-to-dry line."],
  ["oriental-rug-cleaning", "hero", "16:9", "Handmade oriental rug with a medallion pattern on a cleaning table, technician inspecting the fringe with gloves."],
  ["rug-pickup", "hero", "16:9", "Two rolled rugs being loaded into the back of a plain white cargo van in a driveway, no lettering on the van."],
  ["upholstery-cleaning", "hero", "16:9", "Technician cleaning a light fabric sofa with an upholstery tool, clean stripe on a cushion."],
  ["upholstery-cleaning", "card", "4:3", "Close-up of an upholstery cleaning tool on a beige sofa cushion, soil lifting into the tool."],
  ["couch-cleaning", "hero", "16:9", "Large gray sectional in a family room being cleaned, tool on the chaise, pet hair visible on the uncleaned side."],
  ["leather-furniture-cleaning", "hero", "16:9", "Cognac leather sofa being wiped and conditioned, cloth in a gloved hand, sheen on the cleaned cushion."],
  ["microfiber-couch-cleaning", "hero", "16:9", "Microfiber sofa, low-moisture cleaning pad, technician working a cushion, fibers looking refreshed."],
  ["hardwood-floor-cleaning", "hero", "16:9", "Oak hardwood floor being cleaned with a flat mop, dull soiled boards next to clean boards, no puddles."],
  ["hardwood-floor-cleaning", "card", "4:3", "Close-up of oak floor grain, half dusty and half clean, microfiber pad at the edge."],
  ["tile-and-grout-cleaning", "hero", "16:9", "Kitchen floor, professional rotary tile tool, dirty grout on the left and bright grout on the right."],
  ["vinyl-floor-cleaning", "hero", "16:9", "Light wood-look vinyl plank floor being cleaned in a laundry room, machine leaving a clean path."],
  ["natural-stone-cleaning", "hero", "16:9", "Cream marble floor being honed and cleaned, technician kneeling with a pad, veins in the stone visible."],
  ["pet-stain-odor", "hero", "16:9", "Technician treating a yellowed pet stain on beige carpet with a hand sprayer, dog bowl nearby, no animal close-up."],
  ["commercial-carpet-cleaning", "hero", "16:9", "Open office at night, technician cleaning modular carpet tiles with a wide extraction wand, desk legs in frame."],
  ["commercial-carpet-cleaning", "card", "4:3", "Close-up of commercial carpet tiles, one tile freshly cleaned next to a gray soiled tile."],
  ["commercial-air-duct-cleaning", "hero", "16:9", "Warehouse ceiling, technician on a ladder vacuuming a large round spiral duct."],
  ["commercial", "hero", "16:9", "Retail lobby with tile and a carpet runner being cleaned after hours, one technician, lights on."],
  ["car-seat-cleaning", "hero", "16:9", "Fabric car seat being cleaned with a small extractor, door open, daylight, no child in the seat."],
  ["drape-cleaning", "hero", "16:9", "Floor-length linen drapes on a rack in a bright workroom, technician steaming one panel."],
  ["outdoor-furniture-cleaning", "hero", "16:9", "Patio sofa cushions being cleaned on a Southern California terrace, palms in the background."],
  ["encapsulation-carpet-cleaning", "hero", "16:9", "Low-moisture encapsulation machine on commercial loop-pile carpet, crystals on the fibers, no standing water."],
  ["emergency-cleaning", "hero", "16:9", "Evening interior, technician setting air movers around a wet hallway carpet, work lights, urgent but orderly."],
  ["floor-cleaning", "hero", "16:9", "Auto-scrubber on a large tile hallway in a small office building, clean wet path behind it."],
];

loadEnvLocal();
const key = getKey();
if (!key) throw new Error("OPENROUTER_API_KEY missing");

console.log(`model: ${model}, shots: ${SHOTS.length}`);
let n = 0;
for (const [slug, role, aspect, scene] of SHOTS) {
  const name = `svc-${slug}-${role}.png`;
  const file = join(OUT, name);
  if (!force && existsSync(file)) {
    console.log(`skip ${name}`);
    continue;
  }
  try {
    const buf = await generateImage(key, `${scene} ${STYLE}`, {
      model,
      aspect_ratio: aspect,
      resolution: "1K",
      output_format: "png",
      quality: "high",
    });
    writeFileSync(file, buf);
    n++;
    console.log(`[${n}] ${name} (${(buf.length / 1024).toFixed(0)} KB)`);
  } catch (e) {
    console.log(`FAILED ${name}: ${e.message}`);
  }
  await sleep(800);
}
console.log("done", n);
