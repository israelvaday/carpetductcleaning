import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const outDir = path.join(root, "app");
const publicDir = path.join(root, "public");

const NAVY = "#0b2237";
const TEAL = "#14a19a";
const GOLD = "#f0a92e";
const SAND = "#f7f4ee";

const logo = sharp(path.join(publicDir, "images", "logo.webp"));
const { data, info } = await logo
  .clone()
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info;
let minX = 121;
let minY = height;
let maxX = 0;
let maxY = 0;
for (let y = 0; y < height; y++) {
  for (let x = 0; x < 121; x++) {
    const i = (y * width + x) * channels;
    if (data[i + 3] > 30) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}

const mark = await sharp(path.join(publicDir, "images", "logo.webp"))
  .extract({ left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 })
  .png()
  .toBuffer();

async function squareIcon(size, background) {
  const pad = Math.round(size * 0.08);
  const inner = size - pad * 2;
  const glyph = await sharp(mark)
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  return sharp({
    create: { width: size, height: size, channels: 4, background },
  })
    .composite([{ input: glyph, gravity: "centre" }])
    .png()
    .toBuffer();
}

await mkdir(outDir, { recursive: true });
const iconBg = "#ffffff";
await writeFile(path.join(outDir, "icon.png"), await squareIcon(192, iconBg));
await writeFile(path.join(outDir, "apple-icon.png"), await squareIcon(180, iconBg));
await writeFile(path.join(publicDir, "icon-192.png"), await squareIcon(192, iconBg));
await writeFile(path.join(publicDir, "icon-512.png"), await squareIcon(512, iconBg));

function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = 6 + images.length * 16;
  const entries = [];
  for (const img of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(img.size >= 256 ? 0 : img.size, 0);
    entry.writeUInt8(img.size >= 256 ? 0 : img.size, 1);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(img.png.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += img.png.length;
    entries.push(entry);
  }
  return Buffer.concat([header, ...entries, ...images.map((img) => img.png)]);
}

const icoSizes = [16, 32, 48];
await writeFile(
  path.join(outDir, "favicon.ico"),
  ico(await Promise.all(icoSizes.map(async (size) => ({ size, png: await squareIcon(size, iconBg) })))),
);

const logoOnNavy = await sharp(path.join(publicDir, "images", "logo.webp"))
  .resize({ width: 720 })
  .png()
  .toBuffer();

const heroPath = path.join(publicDir, "images", "hero-home.webp");
const photo = await sharp(heroPath)
  .resize(720, 630, { fit: "cover", position: "attention" })
  .modulate({ brightness: 0.92, saturation: 1.05 })
  .png()
  .toBuffer();

const W = 1200;
const H = 630;

const overlay = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="fade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${NAVY}"/>
      <stop offset="0.62" stop-color="${NAVY}"/>
      <stop offset="0.82" stop-color="${NAVY}" stop-opacity="0.55"/>
      <stop offset="1" stop-color="${NAVY}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#fade)"/>
  <rect x="0" y="0" width="8" height="${H}" fill="${GOLD}"/>
  <text x="72" y="318" font-family="Georgia, 'Times New Roman', serif" font-size="64" font-weight="700" fill="${SAND}">Irvine &amp; Orange County</text>
  <text x="72" y="378" font-family="Segoe UI, Arial, sans-serif" font-size="28" fill="#d5e4e2">Carpet · Air ducts · Rugs · Upholstery</text>
  <rect x="72" y="418" width="248" height="52" rx="26" fill="${TEAL}"/>
  <text x="196" y="452" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="24" font-weight="700" fill="white">(949) 992-3299</text>
  <text x="72" y="548" font-family="Segoe UI, Arial, sans-serif" font-size="20" letter-spacing="2" fill="${GOLD}">SINCE 2013  ·  GOOGLE GUARANTEED</text>
</svg>`);

const og = await sharp({
  create: { width: W, height: H, channels: 3, background: NAVY },
})
  .composite([
    { input: photo, left: 560, top: 0 },
    { input: overlay, left: 0, top: 0 },
    { input: logoOnNavy, left: 64, top: 72 },
  ])
  .jpeg({ quality: 86, mozjpeg: true })
  .toBuffer();

const logoCard = await sharp(path.join(publicDir, "images", "logo.webp"))
  .resize({ width: 1266 })
  .flatten({ background: NAVY })
  .png()
  .toBuffer();
await writeFile(path.join(publicDir, "logo.png"), logoCard);
await writeFile(path.join(publicDir, "og.jpg"), og);

console.log("wrote brand assets", { mark: { minX, minY, maxX, maxY }, og: og.length });
