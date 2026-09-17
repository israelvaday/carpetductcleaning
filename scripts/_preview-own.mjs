import sharp from "sharp";
import { join } from "node:path";
import { mkdirSync } from "node:fs";

const M = "C:/APEXDEVSITE/carpetductcleaning.com/media/webp";
const OUT = "C:/APEXDEVSITE/carpetductcleaning.com/media/bh-preview";
mkdirSync(OUT, { recursive: true });

const files = [
  "2026/02/carpet-and-duct-cleaning-van.webp",
  "2025/10/CDC.png.webp",
  "2025/11/Cleaning-compant-truck.webp",
  "2025/11/Truck-mounted-extraction-hose-connected-to-a-home-illustrating-professional-grade-cleaning-power.webp",
];
for (const f of files) {
  const name = f.split("/").pop().replace(/\.(png\.)?webp$/, "");
  try {
    await sharp(join(M, f)).resize(640).jpeg({ quality: 80 }).toFile(join(OUT, `own-${name}.jpg`));
    console.log("ok", name);
  } catch (e) {
    console.log("fail", f, e.message);
  }
}
