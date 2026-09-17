/**
 * Audit photo reuse across built pages. A photo "repeats" when the same
 * /images/<key>.webp appears as a content image on more than one page.
 * (Chrome images like the logo are excluded.)
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const OUT = join(process.cwd(), "out");
const CHROME = new Set(["logo", "logo-02", "google", "bbb"]); // brand badges appear site-wide by design

function* walk(dir) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (e === "index.html") yield p;
  }
}

// key -> Set of page paths
const usage = new Map();
for (const file of walk(OUT)) {
  const page = file.slice(OUT.length).replace(/\\/g, "/").replace(/\/index\.html$/, "") || "/";
  const html = readFileSync(file, "utf8");
  const keys = new Set();
  for (const m of html.matchAll(/\/images\/([a-z0-9-]+?)(?:-sm)?\.webp/g)) {
    const key = m[1];
    if (CHROME.has(key)) continue;
    keys.add(key);
  }
  for (const k of keys) {
    if (!usage.has(k)) usage.set(k, new Set());
    usage.get(k).add(page);
  }
}

const repeats = [...usage.entries()]
  .filter(([, pages]) => pages.size > 1)
  .sort((a, b) => b[1].size - a[1].size);

console.log(`unique photos used: ${usage.size}`);
console.log(`photos on 2+ pages: ${repeats.length}\n`);
for (const [key, pages] of repeats.slice(0, 40)) {
  console.log(`${key}  (${pages.size} pages)`);
  for (const p of [...pages].slice(0, 6)) console.log(`   ${p}`);
  if (pages.size > 6) console.log(`   ... +${pages.size - 6} more`);
}
