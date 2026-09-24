/**
 * Strict launch QA over the static export in out/ (guide section 14 + workspace rules).
 * Usage: node scripts/launch-qa.mjs
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const OUT = "out";
const BASE = "/carpetductcleaning";
const PHONE_OK = /\(949\) 992-3299|949-992-3299|\+19499923299|9499923299/;

function walk(dir) {
  let out = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) out = out.concat(walk(p));
    else if (entry === "index.html") out.push(p);
  }
  return out;
}

const decode = (s) =>
  s.replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const strip = (s) => decode(s.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
const routeOf = (file) => "/" + file.slice(OUT.length + 1).replace(/\\/g, "/").replace(/index\.html$/, "");

const pages = new Map();
const redirects = new Map();
for (const file of walk(OUT)) {
  const html = readFileSync(file, "utf8");
  const route = routeOf(file);
  const refresh = html.match(/http-equiv="refresh" content="\d+;\s*url=([^"]+)"/i);
  if (refresh) redirects.set(route, decode(refresh[1]));
  else pages.set(route, html);
}

const issues = [];
const add = (route, msg) => issues.push(`${route} :: ${msg}`);
const SPAM = /#1\b|\bbest\b|\btrusted\b|5-star|five-star/gi;
const phonesSeen = new Set();
const isNoindex = (html) => /<meta name="robots" content="[^"]*noindex/.test(html);
const staging = [...pages.values()].every(isNoindex);
if (staging) console.log("staging build (site-wide noindex): checking every page as indexable");

for (const [route, html] of pages) {
  if (route === "/404/" || route.startsWith("/_next")) continue;
  const noindex = !staging && isNoindex(html);
  const title = decode((html.match(/<title>([^<]*)<\/title>/) || [])[1] || "");
  const desc = decode((html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || "");
  const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)].map((m) => strip(m[1]));
  const canonical = (html.match(/<link rel="canonical" href="([^"]+)"/) || [])[1];

  if (!noindex) {
    if (title.length < 50 || title.length > 60) add(route, `title ${title.length}: ${title}`);
    if (desc.length < 140 || desc.length > 155) add(route, `meta ${desc.length}: ${desc}`);
    if (!canonical) add(route, "no canonical");
    else {
      const path = new URL(canonical, "https://x").pathname.replace(BASE, "").replace(/\/?$/, "/");
      if (path !== route) add(route, `canonical -> ${path}`);
    }
  }
  if (h1s.length !== 1) add(route, `h1 count ${h1s.length}`);
  const spamHits = (title + " " + desc + " " + h1s.join(" ")).match(SPAM) || [];
  if (spamHits.length >= 2) add(route, `superlative stack: ${spamHits.join(", ")}`);

  for (const m of html.matchAll(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/g)) {
    if (!strip(m[2])) add(route, `empty h${m[1]}`);
  }

  for (const m of html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    try {
      const data = JSON.parse(m[1]);
      const flat = JSON.stringify(data);
      if (/SearchAction/.test(flat)) add(route, "JSON-LD SearchAction");
      if (/"foundingDate":"(?!2013)/.test(flat)) add(route, "JSON-LD foundingDate not 2013");
    } catch {
      add(route, "JSON-LD parse error");
    }
  }

  const text = strip(html.replace(/<script[\s\S]*?<\/script>/g, ""));
  for (const m of text.matchAll(/\(?\d{3}\)?[ .-]\d{3}-\d{4}/g)) if (!PHONE_OK.test(m[0])) phonesSeen.add(`${m[0]} on ${route}`);
  for (const m of text.matchAll(/(?:since|founded in|established in)\s+(\d{4})/gi)) if (m[1] !== "2013") add(route, `year ${m[0]}`);

  for (const m of html.matchAll(/href="(\/carpetductcleaning[^"#?]*)"/g)) {
    let target = m[1].slice(BASE.length) || "/";
    if (/\.(webp|png|jpg|svg|ico|xml|txt|json|css|js)$/.test(target)) {
      if (!existsSync(join(OUT, target))) add(route, `broken asset ${target}`);
      continue;
    }
    if (!target.endsWith("/")) target += "/";
    if (!pages.has(target) && !redirects.has(target)) add(route, `broken link ${target}`);
  }
}

for (const route of pages.keys()) if (route.startsWith("/cleaner-in-")) add(route, "cleaner-in page is a 200");
const mustExist = ["/privacy-policy/", "/terms/", "/sms-terms/", "/upholstery-cleaning/", "/tile-and-grout-cleaning/", "/carpet-cleaning/irvine/", "/carpet-cleaning/huntington-beach/", "/locations/", "/about/", "/contact/"];
for (const r of mustExist) if (!pages.has(r)) add(r, "required page missing");
const sa = redirects.get("/service-area/");
if (!sa || !/\/locations\/?$/.test(sa)) add("/service-area/", `should redirect to /locations (got ${sa})`);

const about = pages.get("/about/") || "";
if (!/2013/.test(about)) add("/about/", "does not mention 2013");
if (!/AboutPage/.test(about)) add("/about/", "missing AboutPage JSON-LD");
if (!/ContactPage/.test(pages.get("/contact/") || "")) add("/contact/", "missing ContactPage JSON-LD");

const formPages = [...pages].filter(([, h]) => /<form/i.test(h));
for (const [route, html] of formPages) {
  for (const legal of ["privacy-policy", "terms", "sms-terms"]) {
    if (!html.includes(`${BASE}/${legal}`)) add(route, `form page missing link to /${legal}`);
  }
}

const sitemap = existsSync(join(OUT, "sitemap.xml")) ? readFileSync(join(OUT, "sitemap.xml"), "utf8") : "";
for (const m of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
  const path = new URL(m[1]).pathname.replace(/^\/carpetductcleaning/, "").replace(/\/?$/, "/");
  if (!pages.has(path)) add("sitemap", `lists non-page ${path}${redirects.has(path) ? " (redirect)" : ""}`);
  if (/cleaner-in-/.test(path)) add("sitemap", `lists ${path}`);
}

console.log(`pages ${pages.size}, redirects ${redirects.size}, form pages ${formPages.length}`);
for (const p of phonesSeen) issues.push(`phone :: unexpected number ${p}`);
const uniq = [...new Set(issues)];
console.log(uniq.length ? `${uniq.length} issues:` : "CLEAN");
for (const line of uniq) console.log("  " + line);
