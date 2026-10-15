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

const SHORT_DAY: Record<string, string> = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
  Sunday: "Sun",
};

/**
 * Hours as grouped ranges for the navigation bar:
 * "Mon–Thu & Sun open 24 hours · Fri 8 AM–5 PM · Sat closed".
 * Days with the same hours are merged instead of listed one by one.
 */
export function compactHours(profile: GoogleProfile | null = getGoogleProfile()) {
  if (!profile?.hours?.length) return "";
  const groups: { label: string; days: string[] }[] = [];
  for (const row of profile.hours) {
    const label = row.hours
      .replace(/^Open 24 hours$/i, "open 24 hours")
      .replace(/^Closed$/i, "closed")
      .replace(/:00(\s?[AP]M)/gi, "$1")
      .replace(/\u2013|\u2014/g, "–");
    const match = groups.find((g) => g.label === label);
    if (match) match.days.push(SHORT_DAY[row.day] || row.day);
    else groups.push({ label, days: [SHORT_DAY[row.day] || row.day] });
  }
  const order = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return groups
    .map((g) => {
      const days = [...g.days].sort((a, b) => order.indexOf(a) - order.indexOf(b));
      const runs: string[] = [];
      let start = 0;
      for (let i = 1; i <= days.length; i++) {
        const contiguous = i < days.length && order.indexOf(days[i]) === order.indexOf(days[i - 1]) + 1;
        if (!contiguous) {
          runs.push(start === i - 1 ? days[start] : `${days[start]}–${days[i - 1]}`);
          start = i;
        }
      }
      return `${runs.join(" & ")} ${g.label}`;
    })
    .join(" · ");
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
