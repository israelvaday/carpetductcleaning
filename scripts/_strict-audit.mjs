import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const OUT = join(process.cwd(), "out");
const CHROME = new Set(["logo", "logo-02", "google", "bbb"]);

function* walk(dir) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (e === "index.html") yield p;
  }
}

const usage = new Map();
for (const file of walk(OUT)) {
  const page = file.slice(OUT.length).replace(/\\/g, "/").replace(/\/index\.html$/, "") || "/";
  const html = readFileSync(file, "utf8");
  const keys = new Set();
  for (const m of html.matchAll(/\/images\/([a-z0-9-]+?)(?:-sm)?\.webp/g)) {
    if (!CHROME.has(m[1])) keys.add(m[1]);
  }
  for (const k of keys) {
    if (!usage.has(k)) usage.set(k, new Set());
    usage.get(k).add(page);
  }
}

let bad = 0;
for (const [key, pages] of usage) {
  if (pages.size < 2) continue;
  const arr = [...pages];
  const nonBlog = arr.filter((p) => !p.startsWith("/blog"));
  // Allowed: a post's own page + the /blog index card for that same post.
  const blogOnly = arr.every((p) => p === "/blog" || p.startsWith("/blog/"));
  const distinctPosts = new Set(arr.filter((p) => p.startsWith("/blog/")).map((p) => p));
  if (!blogOnly || distinctPosts.size > 1 || nonBlog.length > 0) {
    bad++;
    console.log(`REPEAT ${key}: ${arr.join(", ")}`);
  }
}
console.log(bad === 0 ? "\nCLEAN: no photo appears on two different pages (post card + own hero exempted)." : `\n${bad} true repeats remain`);
