import sharp from "sharp";
import { join } from "node:path";
import { mkdirSync } from "node:fs";

const M = "C:/APEXDEVSITE/carpetductcleaning.com/media";
const OUT = "C:/APEXDEVSITE/carpetductcleaning.com/media/bh-preview";
mkdirSync(OUT, { recursive: true });

const files = [
  ["generated/hero-home.png", "gen-hero-home"],
  ["generated/process-clean.png", "gen-process-clean"],
  // real candidates for hero (high-quality landscape carpet/result shots)
  ["webp/2025/09/Carpet-Cleaning-Indoor-Cleaning.webp", "real-carpet-room"],
  ["webp/2025/08/happy-family-relaxing-in-a-clean-living-room.webp", "real-family"],
  ["webp/2026/03/bright-bedroom-with-freshly-cleaned-carpet.webp", "real-bedroom"],
];
for (const [f, name] of files) {
  try {
    await sharp(join(M, f)).resize(560).jpeg({ quality: 78 }).toFile(join(OUT, `cmp-${name}.jpg`));
    console.log("ok", name);
  } catch (e) {
    console.log("fail", f, e.message);
  }
}
