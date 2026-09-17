import { copyFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";

const ROOT = process.cwd();
const dest = join(ROOT, "public", "images");
await mkdir(dest, { recursive: true });

const files = [
  ["media/webp/2026/02/carpet-and-duct-cleaning-van.webp", "van.webp"],
  ["media/webp/2026/02/grey-carpet.webp", "carpet.webp"],
  ["media/webp/2026/02/air-duct.webp", "ducts.webp"],
  ["media/webp/2025/08/bbb-logo.webp", "bbb.webp"],
  ["media/webp/2025/08/1680966838337.webp", "google.webp"],
];

for (const [from, to] of files) {
  try {
    await copyFile(join(ROOT, from), join(dest, to));
    console.log("copied", to);
  } catch (err) {
    console.warn("skip", from, err.message);
  }
}
void dirname;
