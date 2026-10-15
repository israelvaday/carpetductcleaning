// Pass 1: deterministic checks on all 116 routes.
// - exactly one H1, phone present, no banned marketing phrases
// - no scraped-FAQ leftovers (citation junk, DIY recipes)
// - no broken local image references
import { loadEnvLocal } from "./or-lib.mjs";

loadEnvLocal();
const BASE = "http://127.0.0.1:3002";

const res = await fetch(`${BASE}/sitemap.xml`);
const xml = await res.text();
const routes = [...xml.matchAll(/<loc>https:\/\/carpetductcleaning\.com([^<]*)<\/loc>/g)].map((m) => m[1] || "/");

// Strip blockquotes (customer reviews are exempt) and tags.
function visibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<blockquote[\s\S]*?<\/blockquote>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");
}

const BANNED = [
  [/#\s?1\b/i, "#1 claim"],
  [/\b(most trusted|top[- ]rated|5[- ]star service|five[- ]star service)\b/i, "superlative stack"],
  [/\b24\s*\/\s*7\b/i, "24/7 claim"],
  [/\bIICRC\b/i, "IICRC claim"],
  [/\bnon[- ]toxic\b/i, "non-toxic claim"],
  [/\bsanitiz/i, "sanitized claim"],
  [/The Spruce|Wikipedia\+|Reddit\+|Martha Stewart|Southern Living|Better Homes & Gardens|Bellona USA|Limassolian/i, "scraped citation junk"],
  [/mix equal parts|baking soda paste|white vinegar and water|rent a (carpet|steam)|store-bought cleaner/i, "DIY recipe leftover"],
];

let bad = 0;
const imgChecked = new Set();
for (const route of routes) {
  const r = await fetch(BASE + route);
  if (!r.ok) { console.log(`FAIL ${route} HTTP ${r.status}`); bad++; continue; }
  const html = await r.text();
  const problems = [];

  const h1s = (html.match(/<h1[\s>]/g) || []).length;
  if (h1s !== 1) problems.push(`h1 count ${h1s}`);
  if (!html.includes("(949) 992-3299")) problems.push("phone missing");

  const text = visibleText(html);
  for (const [re, label] of BANNED) if (re.test(text)) problems.push(label + ` [${(text.match(re) || [""])[0]}]`);

  // Verify every local image referenced actually resolves (sampled once per src).
  const srcs = [...html.matchAll(/src="(\/images\/[^"]+)"/g)].map((m) => m[1]);
  for (const s of new Set(srcs)) {
    if (imgChecked.has(s)) continue;
    imgChecked.add(s);
    const ir = await fetch(BASE + s, { method: "HEAD" });
    if (!ir.ok) problems.push(`broken image ${s}`);
  }

  if (problems.length) { console.log(`FAIL ${route}\n  - ${problems.join("\n  - ")}`); bad++; }
}
console.log(`\nPASS1: ${routes.length - bad}/${routes.length} routes clean, images checked: ${imgChecked.size}`);
if (bad > 0) process.exit(1);
