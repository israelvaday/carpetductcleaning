import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { site } from "./site";

export type ProfileHour = {
  day: string;
  hours: string;
  opens?: string;
  closes?: string;
};

export type GoogleProfile = {
  source: "google-places";
  placeId: string;
  name: string;
  phone: string;
  internationalPhone: string;
  formattedAddress: string;
  street: string;
  neighborhood: string;
  city: string;
  region: string;
  regionCode: string;
  postalCode: string;
  country: string;
  latitude: number;
  longitude: number;
  plusCode: string;
  mapsUrl: string;
  directionsUrl: string;
  reviewsUrl: string;
  website: string;
  businessStatus: string;
  primaryType: string;
  timeZone: string;
  wheelchairAccessibleParking: boolean;
  hoursSummary: string;
  hours: ProfileHour[];
  fetchedAt: string;
};

// Written by scripts/fetch-reviews.mjs from the Places API. Null until that
// script has run, so pages still build from the static NAP in lib/site.ts.
export function getGoogleProfile(): GoogleProfile | null {
  try {
    const p = join(process.cwd(), "content/google-profile.json");
    if (!existsSync(p)) return null;
    const data = JSON.parse(readFileSync(p, "utf8")) as GoogleProfile;
    if (!data.placeId || typeof data.latitude !== "number" || typeof data.longitude !== "number") return null;
    if (!Array.isArray(data.hours) || !data.hours.length) return null;
    return data;
  } catch {
    return null;
  }
}

export function mapQuery(profile: GoogleProfile | null = getGoogleProfile()) {
  if (profile?.formattedAddress) return `${profile.name}, ${profile.formattedAddress}`;
  return `${site.name}, ${site.street}, ${site.city}, ${site.region} ${site.postalCode}`;
}

export function mapCid(profile: GoogleProfile | null = getGoogleProfile()) {
  return profile?.mapsUrl.match(/[?&]cid=(\d+)/)?.[1] ?? "";
}

const DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function openingHoursSpecification(hours: ProfileHour[]) {
  const groups = new Map<string, string[]>();
  for (const row of hours) {
    if (!row.opens || !row.closes) continue;
    const key = `${row.opens}|${row.closes}`;
    const days = groups.get(key) ?? [];
    days.push(row.day);
    groups.set(key, days);
  }
  return [...groups.entries()].map(([key, days]) => {
    const [opens, closes] = key.split("|");
    const ordered = [...days].sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b));
    return {
      "@type": "OpeningHoursSpecification" as const,
      dayOfWeek: ordered.length === 1 ? ordered[0] : ordered,
      opens,
      closes,
    };
  });
}
