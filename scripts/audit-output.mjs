import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

function walk(dir) {
  let out = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) out = out.concat(walk(p));
    else if (entry === "index.html") out.push(p);
  }
  return out;
}

const files = walk("out");
const bad = [];
let redirects = 0;

for (const file of files) {
  const html = readFileSync(file, "utf8");
  if (html.includes('http-equiv="refresh"')) {
    redirects += 1;
    continue;
  }
  const decode = (s) =>
    s.replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">");
  const title = decode((html.match(/<title>([^<]*)<\/title>/) || [])[1] || "");
  const desc = decode((html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || "");
  const h1s = html.match(/<h1[^>]*>/g) || [];
  const imgs = html.match(/<img\b[^>]*>/g) || [];
  const noAlt = imgs.filter((t) => !/\balt="[^"]+"/.test(t)).length;

  const issues = [];
  if (title.length < 45 || title.length > 62) issues.push(`title=${title.length}`);
  if (!desc) issues.push("no-desc");
  else if (desc.length < 130 || desc.length > 160) issues.push(`desc=${desc.length}`);
  if (h1s.length !== 1) issues.push(`h1=${h1s.length}`);
  if (noAlt) issues.push(`img-no-alt=${noAlt}`);
  if (issues.length) bad.push(`${file.replace(/^out/, "").replace(/index\.html$/, "")} :: ${issues.join(" ")} :: ${title}`);
}

console.log(`pages ${files.length - redirects}, redirect stubs ${redirects}, pages with issues ${bad.length}`);
for (const line of bad.slice(0, 30)) console.log("  " + line);
