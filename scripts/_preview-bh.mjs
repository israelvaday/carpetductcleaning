import sharp from "sharp";
import { join } from "node:path";

const G = "C:/APEXDEVSITE/bhairductcleaningmetrodetroit.com/before and after/images/gallery";
const OUT = "C:/APEXDEVSITE/carpetductcleaning.com/media/bh-preview";
import { mkdirSync } from "node:fs";
mkdirSync(OUT, { recursive: true });

for (const n of ["img-001.webp", "img-007.webp", "img-015.webp", "img-030.webp", "img-050.webp", "img-080.webp", "img-120.webp", "img-150.webp", "img-188.webp"]) {
  try {
    await sharp(join(G, n)).resize(640).jpeg({ quality: 80 }).toFile(join(OUT, n.replace(".webp", ".jpg")));
    console.log("ok", n);
  } catch (e) {
    console.log("fail", n, e.message);
  }
}
