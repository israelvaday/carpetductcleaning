/**
 * AI-verify candidate before/after pairs: same surface, same camera angle.
 * Reads content/_photo-matches.json (fingerprint candidates), checks the top
 * ones with a vision model via OpenRouter, writes the verified best pairs back.
 */
import { readFileSync, writeFileSync } from "fs";
import sharp from "sharp";
import { loadEnvLocal, getKey, pool } from "./or-lib.mjs";

loadEnvLocal();
const key = getKey();
if (!key) throw new Error("OPENROUTER_API_KEY missing");
const MODEL = process.env.OPENROUTER_VISION_MODEL || "google/gemini-2.5-flash-lite";

const jobs = JSON.parse(readFileSync("content/_photo-matches.json", "utf8"));

// Flatten, best fingerprint score first, cap the spend.
const candidates = jobs
  .flatMap((j) => j.pairs.map((p) => ({ ...p, job: j.job, service: j.service })))
  .sort((a, b) => a.score - b.score)
  .slice(0, 90);

console.log(`verifying ${candidates.length} candidate pairs with ${MODEL}`);

async function toDataUrl(file) {
  const buf = await sharp(file)
    .rotate()
    .resize(768, 768, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 70 })
    .toBuffer();
  return `data:image/jpeg;base64,${buf.toString("base64")}`;
}

const PROMPT = `You judge photo pairs for a cleaning company's before/after website slider.
Image 1 should be BEFORE (dirty), image 2 AFTER (clean).
Return only JSON:
{
  "same_surface": true,            // the SAME physical carpet/rug/sofa/area in both photos
  "same_angle": 0,                 // 0-10: 10 = identical camera position and framing, 7+ = close enough that a slider overlay lines up
  "before_dirty_after_clean": true,// image 1 visibly dirty/stained, image 2 visibly cleaned
  "notes": "one short sentence"
}`;

async function verify(pair) {
  try {
    const [u1, u2] = await Promise.all([toDataUrl(pair.before.src), toDataUrl(pair.after.src)]);
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://carpetductcleaning.com",
        "X-Title": "Carpet And Duct Cleaning",
      },
      signal: AbortSignal.timeout(120_000),
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.1,
        response_format: { type: "json_object" },
        max_tokens: 300,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: PROMPT },
              { type: "image_url", image_url: { url: u1 } },
              { type: "image_url", image_url: { url: u2 } },
            ],
          },
        ],
      }),
    });
    if (!res.ok) throw new Error(`${res.status}`);
    const data = await res.json();
    const raw = JSON.parse(
      data.choices[0].message.content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "")
    );
    return { ...pair, verdict: raw };
  } catch (e) {
    return { ...pair, verdict: { error: String(e.message || e) } };
  }
}

let done = 0;
const results = await pool(candidates, 6, async (p) => {
  const r = await verify(p);
  if (++done % 15 === 0) console.log("verified", done);
  return r;
});

const good = results
  .filter(
    (r) =>
      r.verdict &&
      !r.verdict.error &&
      r.verdict.same_surface === true &&
      r.verdict.before_dirty_after_clean === true &&
      Number(r.verdict.same_angle) >= 7
  )
  .sort((a, b) => Number(b.verdict.same_angle) - Number(a.verdict.same_angle) || a.score - b.score)
  .slice(0, 20);

console.log(`passed: ${good.length} of ${results.length}`);
for (const g of good) console.log(` angle=${g.verdict.same_angle} [${g.service}] ${g.before.f} -> ${g.after.f} (${g.verdict.notes})`);

// Rebuild the picker data: group verified pairs by job, score mapped so the
// picker labels angle 9-10 as "very close match".
const byJob = new Map();
for (const g of good) {
  if (!byJob.has(g.job)) byJob.set(g.job, { job: g.job, service: g.service, pairs: [] });
  byJob.get(g.job).pairs.push({
    score: (10 - Number(g.verdict.same_angle)) * 12,
    before: g.before,
    after: g.after,
  });
}
writeFileSync("content/_photo-matches.json", JSON.stringify([...byJob.values()]));
console.log("wrote content/_photo-matches.json with verified pairs");
