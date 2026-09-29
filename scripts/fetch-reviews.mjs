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
 * Also writes content/google-profile.json (hours, geo, Maps links, NAP)
 * from the same Place Details call. Price level is intentionally omitted:
 * Google's automated bucket for this profile is not a quoted rate.
 *
 * Usage: node scripts/fetch-reviews.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "content/reviews.json");
const PROFILE_OUT = join(ROOT, "content/google-profile.json");
const BUSINESS = "Carpet And Duct Cleaning, 191 Pinestone, Irvine, CA 92604";
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

const PLACE_FIELDS = [
  "id",
  "displayName",
  "primaryType",
  "formattedAddress",
  "addressComponents",
  "location",
  "plusCode",
  "nationalPhoneNumber",
  "internationalPhoneNumber",
  "websiteUri",
  "googleMapsUri",
  "googleMapsLinks",
  "businessStatus",
  "regularOpeningHours",
  "timeZone",
  "accessibilityOptions",
  "rating",
  "userRatingCount",
  "reviews.rating",
  "reviews.text",
  "reviews.authorAttribution",
  "reviews.publishTime",
  "reviews.relativePublishTimeDescription",
].join(",");

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

async function fetchPlace(key, placeId) {
  const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": PLACE_FIELDS,
    },
  });
  if (!res.ok) throw new Error(`place details failed: ${res.status} ${await res.text()}`);
  return res.json();
}

function component(components, type, field = "longText") {
  return components?.find((c) => c.types?.includes(type))?.[field] || "";
}

function cidUrl(uri) {
  if (!uri) return "";
  try {
    const cid = new URL(uri).searchParams.get("cid");
    if (cid) return `https://maps.google.com/?cid=${cid}`;
  } catch {
    /* keep the original */
  }
  return uri;
}

function cleanUrl(uri) {
  if (!uri) return "";
  try {
    const u = new URL(uri);
    u.searchParams.delete("g_mp");
    return u.toString();
  } catch {
    return uri;
  }
}

function pad(n) {
  return String(n).padStart(2, "0");
}

function format12(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${pad(m)} ${suffix}`;
}

function labelFor(opens, closes) {
  if (!opens || !closes) return "Closed";
  if (opens === "00:00" && closes === "23:59") return "Open 24 hours";
  return `${format12(opens)}–${format12(closes)}`;
}

// Google periods can span midnight and several days (this profile is open
// Sunday 00:00 through Friday 00:00). Split them into one range per day.
function hoursByDay(periods) {
  const ranges = Array.from({ length: 7 }, () => []);
  for (const period of periods || []) {
    if (!period.open) continue;
    const start = period.open.day * 1440 + period.open.hour * 60 + (period.open.minute || 0);
    let end;
    if (!period.close) end = start + 7 * 1440;
    else {
      end = period.close.day * 1440 + period.close.hour * 60 + (period.close.minute || 0);
      if (end <= start) end += 7 * 1440;
    }
    let cursor = start;
    while (cursor < end) {
      const day = Math.floor(cursor / 1440) % 7;
      const dayStart = Math.floor(cursor / 1440) * 1440;
      const sliceEnd = Math.min(end, dayStart + 1440);
      const openMin = cursor - dayStart;
      const closeMin = sliceEnd - dayStart;
      if (closeMin > openMin) {
        const opens = `${pad(Math.floor(openMin / 60))}:${pad(openMin % 60)}`;
        const closes = closeMin >= 1440 ? "23:59" : `${pad(Math.floor(closeMin / 60))}:${pad(closeMin % 60)}`;
        ranges[day].push({ opens, closes });
      }
      cursor = sliceEnd;
    }
  }
  return ranges;
}

function buildHours(periods) {
  const ranges = hoursByDay(periods);
  const rows = DISPLAY_ORDER.map((day) => {
    const first = ranges[day][0];
    const opens = first?.opens;
    const closes = first?.closes;
    return {
      day: DAYS[day],
      hours: labelFor(opens, closes),
      ...(opens && closes ? { opens, closes } : {}),
    };
  });
  const groups = [];
  for (const row of rows) {
    const last = groups.at(-1);
    if (last && last.hours === row.hours) last.days.push(row.day);
    else groups.push({ hours: row.hours, days: [row.day] });
  }
  const hoursSummary = groups
    .map((g) => {
      const names = g.days.map((d) => DAY_SHORT[DAYS.indexOf(d)]);
      const span = names.length === 1 ? names[0] : `${names[0]}–${names[names.length - 1]}`;
      const value =
        g.hours === "Open 24 hours" ? "open 24 hours" : g.hours === "Closed" ? "closed" : g.hours;
      return `${span} ${value}`;
    })
    .join(" · ");
  return { hours: rows, hoursSummary };
}

function buildProfile(data) {
  const parts = data.addressComponents || [];
  const streetNumber = component(parts, "street_number");
  const route = component(parts, "route");
  const { hours, hoursSummary } = buildHours(data.regularOpeningHours?.periods);
  return {
    source: "google-places",
    placeId: data.id,
    name: data.displayName?.text || "Carpet And Duct Cleaning",
    phone: data.nationalPhoneNumber || "",
    internationalPhone: data.internationalPhoneNumber || "",
    formattedAddress: data.formattedAddress || "",
    street: [streetNumber, route].filter(Boolean).join(" "),
    neighborhood: component(parts, "neighborhood"),
    city: component(parts, "locality"),
    region: component(parts, "administrative_area_level_1"),
    regionCode: component(parts, "administrative_area_level_1", "shortText"),
    postalCode: component(parts, "postal_code"),
    country: component(parts, "country", "shortText") || "US",
    latitude: data.location?.latitude,
    longitude: data.location?.longitude,
    plusCode: data.plusCode?.globalCode || "",
    mapsUrl: cidUrl(data.googleMapsUri),
    directionsUrl: cleanUrl(data.googleMapsLinks?.directionsUri),
    reviewsUrl: cleanUrl(data.googleMapsLinks?.reviewsUri),
    website: data.websiteUri || "",
    businessStatus: data.businessStatus || "",
    primaryType: data.primaryType || "",
    timeZone: data.timeZone?.id || "",
    wheelchairAccessibleParking: Boolean(data.accessibilityOptions?.wheelchairAccessibleParking),
    hoursSummary,
    hours,
    fetchedAt: new Date().toISOString(),
  };
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
  const data = await fetchPlace(key, placeId);

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
    mapsUrl: cidUrl(data.googleMapsUri),
    fetchedAt: new Date().toISOString(),
    reviews,
  };
  writeFileSync(OUT, JSON.stringify(out, null, 2));
  const profile = buildProfile(data);
  writeFileSync(PROFILE_OUT, JSON.stringify(profile, null, 2));
  console.log(`Wrote ${reviews.length} reviews (${out.rating}★ across ${out.totalRatings} ratings) -> content/reviews.json`);
  console.log(`Wrote Google profile (${profile.hoursSummary}) -> content/google-profile.json`);
  if (profile.phone && profile.phone !== "(949) 992-3299") {
    console.warn(`GBP phone ${profile.phone} does not match the site phone.`);
  }
  if (profile.street && profile.street !== "191 Pinestone") {
    console.warn(`GBP street "${profile.street}" does not match the site address.`);
  }
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
