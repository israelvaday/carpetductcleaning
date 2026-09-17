import urlMap from "@/audit/next-url-map.json";
import map from "@/content/image-map.json";
import photoTags from "@/content/photo-tags.json";

export type Img = { src: string; alt: string };

// basePath is applied to next/link and the _next bundle, but not to image
// sources, so every file under /public has to be prefixed by hand.
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function asset(path: string): string {
  return `${base}${path}`;
}

// Must stay in sync with scripts/copy-public-images.mjs srcToKey.
function srcToKey(src: string): string {
  return src
    .replace(/\.(jpg|jpeg|png|gif)\.webp$/i, "")
    .replace(/\.(webp|png|jpe?g|gif|avif)$/i, "")
    .split("/")
    .pop()!
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Alt text indexed by media src. Manifest entries first, then the vision tags
// (which carry an alt for every tagged photo, including pool-only ones).
const altBySrc = new Map<string, string>();
for (const a of map.assets) altBySrc.set(a.src, a.alt);
for (const g of map.gallery) altBySrc.set(g.src, g.alt);
for (const s of map.services) altBySrc.set(s.src, s.alt);
for (const [src, t] of Object.entries(photoTags as Record<string, { alt?: string }>)) {
  if (t?.alt && !altBySrc.has(src)) altBySrc.set(src, t.alt);
}

// Named assets (logo, hero-home, map, ...) are looked up by their manifest key.
const assetByKey = new Map(map.assets.map((a) => [a.key, a]));
const serviceBySlug = new Map(map.services.map((s) => [s.slug, s]));

function fromSrc(src: string, size: "full" | "sm" = "full"): Img {
  const key = srcToKey(src);
  const file = size === "sm" ? `${key}-sm.webp` : `${key}.webp`;
  return { src: asset(`/images/${file}`), alt: altBySrc.get(src) ?? "" };
}

export function img(key: string, alt?: string): Img {
  const assetEntry = assetByKey.get(key);
  if (assetEntry) return { src: fromSrc(assetEntry.src).src, alt: alt ?? assetEntry.alt };
  // Already a public path key with no manifest entry (shouldn't happen often).
  return { src: asset(`/images/${key}.webp`), alt: alt ?? "" };
}

export function serviceImage(slug: string, size: "hero" | "card" = "hero"): Img {
  const svc = serviceBySlug.get(slug);
  if (!svc) return img("hero-home");
  return fromSrc(svc.src, size === "card" ? "sm" : "full");
}

// Round-robin through the pool by the city's position in the URL map, so no
// photo repeats until every option has been used once.
const cityOrder = new Map<string, number>();
const perService = new Map<string, number>();
for (const page of urlMap.cityPages) {
  const [, service, city] = page.route.split("/");
  const n = perService.get(service) ?? 0;
  cityOrder.set(`${service}/${city}`, n);
  perService.set(service, n + 1);
}

const cityExact = map.cityExact as Record<string, string>;
const cityPool = map.cityPool as Record<string, string[]>;

export function cityImage(service: string, city: string): Img {
  const key = `${service}/${city}`;
  const exact = cityExact[key];
  if (exact) {
    // cityExact values may be a named asset key or a raw src.
    const assetEntry = assetByKey.get(exact);
    return assetEntry ? fromSrc(assetEntry.src) : fromSrc(exact);
  }
  const pool = cityPool[service];
  if (pool?.length) return fromSrc(pool[(cityOrder.get(key) ?? 0) % pool.length]);
  return serviceImage(service);
}

export const gallery: Img[] = map.gallery.map((g) => fromSrc(g.src));

const POST_RULES: [RegExp, string][] = [
  [/dryer|lint/i, "dryer-vent-cleaning"],
  [/duct|vent|air.quality|allerg|hvac/i, "air-duct-cleaning"],
  [/water|flood|restoration/i, "water-damage-restoration"],
  [/oriental|persian|wool/i, "oriental-rug-cleaning"],
  [/rug/i, "area-rug-cleaning"],
  [/upholster|sofa|couch|mattress|fabric/i, "upholstery-cleaning"],
  [/hardwood|wood.floor/i, "hardwood-floor-cleaning"],
  [/tile|grout/i, "tile-and-grout-cleaning"],
  [/vinyl/i, "vinyl-floor-cleaning"],
  [/marble|stone|travertine/i, "natural-stone-cleaning"],
  [/pet|odor/i, "pet-stain-odor"],
  [/curtain|drape/i, "drape-cleaning"],
  [/outdoor|patio|furniture/i, "outdoor-furniture-cleaning"],
  [/car|rv|vehicle/i, "car-seat-cleaning"],
  [/commercial|office|hotel/i, "commercial-carpet-cleaning"],
  [/protector|stain/i, "carpet-cleaning"],
];

export function postImage(slug: string, title = ""): Img {
  const hay = `${slug} ${title}`;
  for (const [re, svc] of POST_RULES) if (re.test(hay)) return serviceImage(svc);
  return serviceImage("carpet-cleaning");
}
