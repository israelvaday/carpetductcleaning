import map from "@/content/image-map.json";
import photoTags from "@/content/photo-tags.json";
import sitePhotos from "@/content/site-photos.json";

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
// (which carry an alt for every tagged photo).
const altBySrc = new Map<string, string>();
for (const a of map.assets) altBySrc.set(a.src, a.alt);
for (const g of map.gallery) altBySrc.set(g.src, g.alt);
for (const s of map.services) {
  altBySrc.set(s.hero, s.alt);
  if (s.alt) {
    for (const src of [s.card, s.picker]) if (src && !altBySrc.has(src)) altBySrc.set(src, s.alt);
  }
}
for (const [src, t] of Object.entries(photoTags as Record<string, { alt?: string }>)) {
  if (t?.alt && !altBySrc.has(src)) altBySrc.set(src, t.alt);
}

function fromSrc(src: string, size: "full" | "sm" = "full"): Img {
  const key = srcToKey(src);
  const file = size === "sm" ? `${key}-sm.webp` : `${key}.webp`;
  return { src: asset(`/images/${file}`), alt: altBySrc.get(src) ?? "" };
}

// Named assets (logo, hero-home, truck, van, process steps, ...).
const assetByKey = new Map(map.assets.map((a) => [a.key, a]));

type Shot = { src: string; alt: string };

const realAssets = sitePhotos.assets as Record<string, Shot>;
const realServices = sitePhotos.services as Record<string, Shot>;

function shot(photo: Shot): Img {
  return { src: asset(photo.src), alt: photo.alt };
}

export function img(key: string, alt?: string): Img {
  const real = realAssets[key];
  if (real) return { src: asset(real.src), alt: alt ?? real.alt };
  const assetEntry = assetByKey.get(key);
  if (assetEntry) return { src: fromSrc(assetEntry.src).src, alt: alt ?? assetEntry.alt };
  return { src: asset(`/images/${key}.webp`), alt: alt ?? "" };
}

type ServiceEntry = {
  slug: string;
  hero: string;
  card: string | null;
  picker: string | null;
  steps: string[];
  alt: string;
};
const serviceBySlug = new Map((map.services as unknown as ServiceEntry[]).map((s) => [s.slug, s]));

export type ServiceImageRole = "hero" | "card" | "picker";

// A crew photo replaces only the service-page hero. Cards, quote tiles, and
// step photos stay on their own images so one file is never shown twice.
export function serviceImage(slug: string, role: ServiceImageRole = "hero"): Img {
  const real = role === "hero" ? realServices[slug] : undefined;
  if (real?.src) return shot(real);
  const svc = serviceBySlug.get(slug);
  if (!svc) return img("hero-home");
  const src = svc[role] || svc.card || svc.hero;
  return fromSrc(src, role === "hero" ? "full" : "sm");
}

// The four process-wizard panels on a service hub — unique to that service.
// Quote tiles only get a photo when the map assigned one that is not already
// the service card. A missing picker stays a text choice so the card photo
// is not shown a second time.
const PICKER_ALT: Record<string, string> = {
  "drape-cleaning": "Sailboat curtains hanging in a bedroom",
  "outdoor-furniture-cleaning": "Beige cushions in a wicker outdoor chair",
};

export function servicePickerImage(slug: string): Img | null {
  const svc = serviceBySlug.get(slug);
  if (!svc?.picker) return null;
  const image = fromSrc(svc.picker, "sm");
  return { ...image, alt: PICKER_ALT[slug] || image.alt };
}

export function serviceSteps(slug: string): Img[] {
  const svc = serviceBySlug.get(slug);
  if (!svc || !svc.steps?.length) return [];
  return svc.steps.map((s) => fromSrc(s));
}

// Unique hero per city — no two city pages share a photo.
const cityExact = map.cityExact as Record<string, string>;

export function cityImage(service: string, city: string): Img {
  const exact = cityExact[`${service}/${city}`];
  if (exact) return fromSrc(exact);
  const svc = serviceBySlug.get(service);
  if (svc) return fromSrc(svc.hero);
  return img("hero-home");
}

// The city's tile on /locations — a generated landmark photo of that city,
// keyed by city alone (a city looks the same for every service).
const cityLandmarks = (map as unknown as { cityLandmarks: Record<string, { src: string; alt: string }> })
  .cityLandmarks || {};

export function cityLandmark(city: string): Img {
  const entry = cityLandmarks[city];
  if (entry) return { ...fromSrc(entry.src, "sm"), alt: entry.alt };
  return img("truck");
}

// Unique per-city job photos for the "Jobs near you" strip.
const cityJobsMap = map.cityJobs as Record<string, string[]>;

export function cityJobs(service: string, city: string): Img[] {
  const srcs = cityJobsMap[`${service}/${city}`] || [];
  return srcs.map((s) => fromSrc(s));
}

// Unique image per blog post.
const postSrcs = map.posts as Record<string, string>;

export function postImage(slug: string): Img {
  const src = postSrcs[slug];
  if (src) {
    const photo = fromSrc(src);
    if (!photo.alt) photo.alt = slug.replaceAll("-", " ");
    return photo;
  }
  return img("hero-home");
}

export const gallery: Img[] = map.gallery.map((g) => fromSrc(g.src));
