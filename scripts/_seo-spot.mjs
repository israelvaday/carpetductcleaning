// Focused SEO spot-check on the pages changed in this batch.
const BASE = "http://127.0.0.1:3005";
const pages = [
  "/",
  "/carpet-cleaning/",
  "/yacht-cleaning/",
  "/area-rug-cleaning/",
  "/couch-cleaning/",
  "/water-damage-restoration/",
  "/upholstery-cleaning/",
];

for (const p of pages) {
  const html = await (await fetch(BASE + p)).text();
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || "MISSING";
  const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || "MISSING";
  const canon = (html.match(/<link rel="canonical" href="([^"]*)"/) || [])[1] || "MISSING";
  const og = (html.match(/<meta property="og:title" content="([^"]*)"/) || [])[1] || "MISSING";
  const h1 = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || ["", ""])[1].replace(/<[^>]+>/g, "").trim();
  const lds = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
  const ldOk = [];
  let ldErr = 0;
  for (const m of lds) {
    try {
      const j = JSON.parse(m[1]);
      ldOk.push(j["@type"] || (j["@graph"] ? "graph" : "?"));
    } catch {
      ldErr++;
    }
  }
  console.log("== " + p);
  console.log(`  title(${title.length}): ${title}`);
  console.log(`  desc(${desc.length}): ${desc.slice(0, 170)}`);
  console.log("  canonical: " + canon);
  console.log("  og:title: " + (og !== "MISSING" ? "ok" : "MISSING"));
  console.log("  h1: " + h1);
  console.log("  json-ld: " + ldOk.join(", ") + (ldErr ? "  PARSE ERRORS: " + ldErr : ""));
}
