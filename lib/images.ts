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

export function img(key: string, alt?: string): Img {
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

// Each role returns a DIFFERENT photo — a service's hub hero, homepage card,
// related-services card, and quote-picker tile never share an image.
export function serviceImage(slug: string, role: ServiceImageRole = "hero"): Img {
  const svc = serviceBySlug.get(slug);
  if (!svc) return img("hero-home");
  // picker falls back to card (both render on the homepage), never to hero —
  // the hero belongs to the service hub page alone.
  const src = svc[role] || svc.card || svc.hero;
  return fromSrc(src, role === "hero" ? "full" : "sm");
}

// The four process-wizard panels on a service hub — unique to that service.
export function serviceSteps(slug: string): Img[] {
  const svc = serviceBySlug.get(slug);
  if (!svc || !svc.steps?.length) return [];
  return svc.steps.map((s) => fromSrc(s));
}

// Unique hero per city — no two city pages share a photo.
const cityExact = map.cityExact as Record<string, string>;
const cityCardMap = (map as unknown as { cityCard: Record<string, string> }).cityCard || {};

export function cityImage(service: string, city: string): Img {
  const exact = cityExact[`${service}/${city}`];
  if (exact) return fromSrc(exact);
  return serviceImage(service, "hero");
}

// The city's tile on /locations — a different photo from the city page hero.
export function cityCardImage(service: string, city: string): Img {
  const src = cityCardMap[`${service}/${city}`];
  if (src) return fromSrc(src, "sm");
  return serviceImage(service, "card");
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
  if (src) return fromSrc(src);
  return img("hero-home");
}

export const gallery: Img[] = map.gallery.map((g) => fromSrc(g.src));
