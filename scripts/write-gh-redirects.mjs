import { mkdir, writeFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const map = JSON.parse(readFileSync(new URL("../audit/next-url-map.json", import.meta.url), "utf8"));
const base = process.env.GITHUB_PAGES === "true" ? "/carpetductcleaning" : "";
const out = join(process.cwd(), "out");

function norm(path) {
  if (!path || path === "/") return "/";
  return `/${path.replace(/^\/+|\/+$/g, "")}`;
}

function html(to) {
  const dest = `${base}${to.endsWith("/") ? to : `${to}/`}`;
  return `<!doctype html>
<meta charset="utf-8">
<title>Moved</title>
<meta http-equiv="refresh" content="0;url=${dest}">
<link rel="canonical" href="${dest}">
<script>location.replace(${JSON.stringify(dest)})</script>
<p><a href="${dest}">This page has moved</a>.</p>
`;
}

const reserved = new Set(["/"]);
for (const group of [...map.serviceHubs, ...map.cityPages, ...map.utility]) {
  reserved.add(norm(group.route));
}

const pairs = [];
for (const group of [...map.serviceHubs, ...map.cityPages, ...map.utility]) {
  for (const from of group.from || []) {
    if (!from || from.startsWith("^")) continue;
    const fromNorm = norm(from);
    const to = group.route === "/" ? "/" : `${norm(group.route)}/`;
    if (fromNorm === "/" || fromNorm === norm(to) || reserved.has(fromNorm)) continue;
    pairs.push({ from: fromNorm, to });
  }
}

let written = 0;
let skipped = 0;
for (const { from, to } of pairs) {
  const clean = from.replace(/^\//, "");
  if (!clean) continue;
  const dir = join(out, clean);
  const file = join(dir, "index.html");
  if (existsSync(file)) {
    skipped += 1;
    continue;
  }
  await mkdir(dir, { recursive: true });
  await writeFile(file, html(to));
  written += 1;
}

await writeFile(join(out, ".nojekyll"), "");
console.log("redirect pages", written, "skipped existing", skipped);
