import urlMap from "@/audit/next-url-map.json";
import map from "@/content/image-map.json";

export type Img = { src: string; alt: string };

const alts = new Map<string, string>();
for (const a of map.assets) alts.set(a.key, a.alt);
for (const g of map.gallery) alts.set(g.key, g.alt);
for (const s of map.services) alts.set(`svc-${s.slug}`, s.alt);

const serviceKeys = new Set(map.services.map((s) => s.slug));
const cityExact = map.cityExact as Record<string, string>;
const cityPool = map.cityPool as Record<string, string[]>;

// basePath is applied to next/link and the _next bundle, but not to image
// sources, so every file under /public has to be prefixed by hand.
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function asset(path: string): string {
  return `${base}${path}`;
}

export function img(key: string, alt?: string): Img {
  return { src: asset(`/images/${key}.webp`), alt: alt ?? alts.get(key) ?? "" };
}

export function serviceImage(slug: string, size: "hero" | "card" = "hero"): Img {
  if (!serviceKeys.has(slug)) return img("hero-home");
  const key = `svc-${slug}`;
  const src = asset(size === "card" ? `/images/${key}-sm.webp` : `/images/${key}.webp`);
  return { src, alt: alts.get(key) ?? "" };
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

export function cityImage(service: string, city: string): Img {
  const key = `${service}/${city}`;
  const exact = cityExact[key];
  if (exact) return img(exact);
  const pool = cityPool[service];
  if (pool?.length) return img(pool[(cityOrder.get(key) ?? 0) % pool.length]);
  return serviceImage(service);
}

export const gallery: Img[] = map.gallery.map((g) => img(g.key));

const POST_RULES: [RegExp, string][] = [
  [/dryer|lint/i, "svc-dryer-vent-cleaning"],
  [/duct|vent|air.quality|allerg|hvac/i, "svc-air-duct-cleaning"],
  [/water|flood|restoration/i, "svc-water-damage-restoration"],
  [/oriental|persian|wool/i, "svc-oriental-rug-cleaning"],
  [/rug/i, "svc-area-rug-cleaning"],
  [/upholster|sofa|couch|mattress|fabric/i, "svc-upholstery-cleaning"],
  [/hardwood|wood.floor/i, "svc-hardwood-floor-cleaning"],
  [/tile|grout/i, "svc-tile-and-grout-cleaning"],
  [/vinyl/i, "svc-vinyl-floor-cleaning"],
  [/marble|stone|travertine/i, "svc-natural-stone-cleaning"],
  [/pet|odor/i, "svc-pet-stain-odor"],
  [/curtain|drape/i, "svc-drape-cleaning"],
  [/outdoor|patio|furniture/i, "svc-outdoor-furniture-cleaning"],
  [/car|rv|vehicle/i, "svc-car-seat-cleaning"],
  [/commercial|office|hotel/i, "svc-commercial-carpet-cleaning"],
  [/protector|stain/i, "svc-carpet-cleaning"],
];

export function postImage(slug: string, title = ""): Img {
  const hay = `${slug} ${title}`;
  for (const [re, key] of POST_RULES) if (re.test(hay)) return img(key);
  return img("svc-carpet-cleaning");
}
