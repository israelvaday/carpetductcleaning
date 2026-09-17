import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export type Review = {
  author: string;
  rating: number;
  text: string;
  when: string;
  publishedAt: string;
};

export type ReviewsData = {
  source: "google-places";
  placeId: string;
  business: string;
  rating: number;
  totalRatings: number;
  mapsUrl: string;
  fetchedAt: string;
  reviews: Review[];
};

// Loaded at build time; null until scripts/fetch-reviews.mjs has run with a
// GOOGLE_PLACES_API_KEY. Every deploy re-fetches, so the numbers stay live.
export function getReviews(): ReviewsData | null {
  try {
    const p = join(process.cwd(), "content/reviews.json");
    if (!existsSync(p)) return null;
    const data = JSON.parse(readFileSync(p, "utf8")) as ReviewsData;
    if (!data.reviews?.length) return null;
    return data;
  } catch {
    return null;
  }
}
