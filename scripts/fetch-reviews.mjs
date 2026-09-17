/**
 * Pull live Google reviews for the business into content/reviews.json.
 * Runs at build time (static host) — every deploy refreshes the reviews.
 *
 * Setup (one time):
 *   1. console.cloud.google.com → create project → enable "Places API (New)"
 *   2. Create an API key (Credentials → Create credentials → API key)
 *   3. Add to .env.local:
 *        GOOGLE_PLACES_API_KEY=AIza...
 *        GOOGLE_PLACE_ID=ChIJ...   (optional — without it we search by name+address)
 *
 * Usage: node scripts/fetch-reviews.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "content/reviews.json");
const BUSINESS = "Carpet And Duct Cleaning, 191 Pinestone, Irvine, CA 92604";

function loadEnvLocal() {
  const p = join(ROOT, ".env.local");
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

async function findPlaceId(key) {
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": "places.id,places.displayName,places.rating,places.userRatingCount",
    },
    body: JSON.stringify({ textQuery: BUSINESS }),
  });
  if (!res.ok) throw new Error(`searchText failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  const place = data.places?.[0];
  if (!place) throw new Error("Business not found on Google Places");
  console.log(`Found: ${place.displayName?.text} (${place.id}) — ${place.rating}★, ${place.userRatingCount} ratings`);
  return place.id;
}

async function fetchReviews(key, placeId) {
  const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask":
        "id,displayName,rating,userRatingCount,googleMapsUri,reviews.rating,reviews.text,reviews.authorAttribution,reviews.publishTime,reviews.relativePublishTimeDescription",
    },
  });
  if (!res.ok) throw new Error(`place details failed: ${res.status} ${await res.text()}`);
  return res.json();
}

async function main() {
  loadEnvLocal();
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) {
    console.log("GOOGLE_PLACES_API_KEY not set — keeping existing content/reviews.json (if any).");
    console.log("See the header of this script for the 3-step setup.");
    return;
  }
  const placeId = process.env.GOOGLE_PLACE_ID || (await findPlaceId(key));
  const data = await fetchReviews(key, placeId);

  const reviews = (data.reviews || [])
    .filter((r) => r.rating >= 4 && r.text?.text)
    .map((r) => ({
      author: r.authorAttribution?.displayName || "Google user",
      rating: r.rating,
      text: r.text.text,
      when: r.relativePublishTimeDescription || "",
      publishedAt: r.publishTime || "",
    }))
    .sort((a, b) => (b.publishedAt || "").localeCompare(a.publishedAt || ""));

  const out = {
    source: "google-places",
    placeId: data.id,
    business: data.displayName?.text || "Carpet And Duct Cleaning",
    rating: data.rating,
    totalRatings: data.userRatingCount,
    mapsUrl: data.googleMapsUri,
    fetchedAt: new Date().toISOString(),
    reviews,
  };
  writeFileSync(OUT, JSON.stringify(out, null, 2));
  console.log(`Wrote ${reviews.length} reviews (${out.rating}★ across ${out.totalRatings} ratings) -> content/reviews.json`);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
