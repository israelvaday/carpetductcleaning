/**
 * Pull ALL reviews from the Google Business Profile API (owner OAuth) and
 * write content/reviews.json. Run after scripts/gbp-auth.mjs has stored
 * GBP_REFRESH_TOKEN in .env.local. Falls back to the Places-sourced file
 * (scripts/fetch-reviews.mjs) when GBP credentials are absent.
 *
 * Usage: node scripts/fetch-reviews-gbp.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ENV = join(ROOT, ".env.local");
const OUT = join(ROOT, "content/reviews.json");
const LOCATION_MATCH = /carpet|pinestone/i;
const MAX_STORED = 400;

for (const line of readFileSync(ENV, "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

if (process.env.GBP_VARS_FILE && existsSync(process.env.GBP_VARS_FILE)) {
  const extra = JSON.parse(readFileSync(process.env.GBP_VARS_FILE, "utf8").replace(/^\uFEFF/, ""));
  for (const [key, value] of Object.entries(extra)) {
    if (typeof value === "string" && value && !process.env[key]) process.env[key] = value;
  }
}

const clientId = process.env.GBP_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GBP_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
const refreshToken = process.env.GBP_REFRESH_TOKEN || process.env.GOOGLE_REFRESH_TOKEN;
const accountName = process.env.GBP_ACCOUNT_NAME || "accounts/113074257338651759696";
if (!clientId || !clientSecret || !refreshToken) {
  console.log("GBP credentials missing — run scripts/gbp-auth.mjs first. Keeping existing reviews.json.");
  process.exit(0);
}

async function accessToken() {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error("token refresh failed: " + JSON.stringify(data).slice(0, 300));
  return data.access_token;
}

async function gbpGet(url, token) {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`GBP ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return res.json();
}

const STAR = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };

function relativeTime(iso) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "a day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return months === 1 ? "a month ago" : `${months} months ago`;
  const years = Math.floor(months / 12);
  return years === 1 ? "a year ago" : `${years} years ago`;
}

const token = await accessToken();

const locations = [];
let locationPage = "";
do {
  const url = new URL(`https://mybusinessbusinessinformation.googleapis.com/v1/${accountName}/locations`);
  url.searchParams.set("readMask", "name,title");
  url.searchParams.set("pageSize", "100");
  if (locationPage) url.searchParams.set("pageToken", locationPage);
  const page = await gbpGet(url, token);
  locations.push(...(page.locations || []));
  locationPage = page.nextPageToken || "";
} while (locationPage);

const location =
  locations.find((l) => LOCATION_MATCH.test(l.title || "")) ||
  locations[0];
if (!location) throw new Error("No locations found on this account");
console.log("locations:", locations.map((l) => l.title).join(" | "));
console.log("using:", location.title);

// Page through every review, newest first.
const all = [];
let pageToken = "";
let averageRating = 0;
let totalReviewCount = 0;
do {
  const qs = new URLSearchParams({ pageSize: "50", orderBy: "updateTime desc" });
  if (pageToken) qs.set("pageToken", pageToken);
  const page = await gbpGet(
    `https://mybusiness.googleapis.com/v4/${accountName}/${location.name}/reviews?${qs}`,
    token,
  );
  averageRating = page.averageRating || averageRating;
  totalReviewCount = page.totalReviewCount || totalReviewCount;
  for (const r of page.reviews || []) {
    const rating = STAR[r.starRating] || 0;
    const text = r.comment || "";
    if (!text) continue;
    all.push({
      author: r.reviewer?.displayName || "Google user",
      rating,
      text,
      when: relativeTime(r.updateTime || r.createTime),
      publishedAt: r.createTime || r.updateTime || "",
    });
  }
  pageToken = page.nextPageToken || "";
} while (pageToken && all.length < MAX_STORED);

console.log(`fetched ${totalReviewCount} total, kept ${all.length} with written comments`);

// Preserve the Places-sourced fields (placeId, mapsUrl) from the existing file.
let prev = {};
if (existsSync(OUT)) {
  try {
    prev = JSON.parse(readFileSync(OUT, "utf8"));
  } catch {}
}

writeFileSync(
  OUT,
  JSON.stringify(
    {
      source: "google-business-profile",
      placeId: prev.placeId || "",
      business: location.title || prev.business || "Carpet And Duct Cleaning",
      rating: averageRating ? Math.round(averageRating * 10) / 10 : prev.rating,
      totalRatings: totalReviewCount || prev.totalRatings,
      mapsUrl: prev.mapsUrl || "",
      fetchedAt: new Date().toISOString(),
      reviews: all.slice(0, MAX_STORED),
    },
    null,
    2
  )
);
console.log(`wrote ${Math.min(all.length, MAX_STORED)} reviews (${averageRating}★ across ${totalReviewCount}) -> content/reviews.json`);
