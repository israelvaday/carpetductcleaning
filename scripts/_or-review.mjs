// Pass 2: OpenRouter LLM review, page by page, of every page changed in this
// round: all 33 service hubs + homepage + locations.
import fs from "node:fs";
import { loadEnvLocal, getKey, chatJson, pool } from "./or-lib.mjs";

loadEnvLocal();
const key = getKey();
const BASE = "http://127.0.0.1:3002";

const services = Object.keys(JSON.parse(fs.readFileSync("content/generated/services.json", "utf8")));
const routes = ["/", "/locations/", ...services.map((s) => `/${s}/`)];

function visibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<[^>]+>/g, "\n")
    .replace(/[\t ]+/g, " ")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

const SYSTEM = `You review one page of a local cleaning company website (Carpet And Duct Cleaning, Irvine/Orange County, founded 2013, phone (949) 992-3299). The company DOES the work for customers. Report ONLY real problems from this checklist:
1. DIY-voice content: any FAQ or paragraph that teaches the reader to clean it themselves (recipes like vinegar/baking soda, product recommendations to buy, step-by-step home instructions). Honest prep advice before a visit (e.g. "blot it and call us") is FINE.
2. Scraped junk: citation fragments like "The Spruce+6", "Wikipedia+1", publication names mid-sentence, or navigation text bleeding into answers.
3. Banned marketing: "#1", "best in", "most trusted", "top-rated", "5-star" (outside customer review quotes), "24/7", "IICRC", "non-toxic", "sanitized".
4. Wrong facts: founding year not 2013, phone not (949) 992-3299.
5. Gibberish, truncated sentences, or text that contradicts itself.
Customer review quotes are exempt from all checks.
Respond with JSON only: {"pass": true} or {"pass": false, "problems": ["short description", ...]}. Do not invent problems. Style preferences are not problems.`;

const results = await pool(routes, 4, async (route) => {
  const r = await fetch(BASE + route);
  if (!r.ok) return { route, pass: false, problems: [`HTTP ${r.status}`] };
  const text = visibleText(await r.text()).slice(0, 14000);
  try {
    const out = await chatJson(key, "anthropic/claude-sonnet-4.5", SYSTEM, `PAGE ${route}\n\n${text}`, 0, 1000);
    return { route, ...out };
  } catch (e) {
    return { route, pass: false, problems: ["review call failed: " + String(e).slice(0, 120)] };
  }
});

let failed = 0;
for (const res of results) {
  if (res.pass) continue;
  failed++;
  console.log(`FAIL ${res.route}`);
  for (const p of res.problems || []) console.log(`  - ${p}`);
}
console.log(`\nPASS2: ${results.length - failed}/${results.length} pages pass LLM review`);
