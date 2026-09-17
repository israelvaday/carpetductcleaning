import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import urlMap from "@/audit/next-url-map.json";
import { metaTitle, titleCase } from "./utils";
import { cityIntro, cleanParagraphs, composeMeta, extractFaqs } from "./text";
import { cityDetail, cityFaqs, onTopicFaqs, serviceBlurb } from "./services";

export type WpPage = {
  title: string;
  slug: string;
  text?: string;
  wordCount?: number;
  seo?: { title?: string; description?: string };
};

const ROOT = process.cwd();

function readJson<T>(rel: string): T {
  return JSON.parse(readFileSync(join(ROOT, rel), "utf8")) as T;
}

function loadPage(slug: string): WpPage | null {
  try {
    return readJson<WpPage>(`content/pages/${slug}.json`);
  } catch {
    return null;
  }
}

const HUB_SOURCE: Record<string, string> = {
  "carpet-cleaning": "carpet-cleaning",
  "air-duct-cleaning": "air-duct-cleaning",
  "dryer-vent-cleaning": "dryer-vent-cleaning",
  "water-damage-restoration": "water-damage-restoration",
  "area-rug-cleaning": "area-rug-cleaning",
  "oriental-rug-cleaning": "oriental-rug-cleaning",
  "rug-pickup": "rug-pickup-drop-off",
  "upholstery-cleaning": "furniture-upholstery-cleaning",
  "couch-cleaning": "couch-sectional-cleaning",
  "leather-furniture-cleaning": "leather-furniture-cleaning",
  "microfiber-couch-cleaning": "microfiber-couch-cleaning",
  "hardwood-floor-cleaning": "hardwood-floor-cleaning",
  "tile-and-grout-cleaning": "tile-and-grout-cleaning-3",
  "vinyl-floor-cleaning": "vinyl-floor-cleaning",
  "natural-stone-cleaning": "natural-stone-cleaning",
  "pet-stain-odor": "pet-stain-odor-treatment",
  "commercial-carpet-cleaning": "commercial-carpet-cleaning",
  "commercial-air-duct-cleaning": "commercial-air-duct-cleaning",
  commercial: "commercial-cleaning-services",
  "car-seat-cleaning": "car-seat-cleaning",
  "drape-cleaning": "drapes-curtain-cleaning",
  "outdoor-furniture-cleaning": "outdoor-furniture-cushion-cleaning",
  "encapsulation-carpet-cleaning": "encapsulation-carpet-cleaning",
  "emergency-cleaning": "emergency-cleaning-services",
  "floor-cleaning": "floor-cleaning",
};

export function serviceSlugs() {
  return urlMap.serviceHubs.map((h) => h.route.replace(/^\//, ""));
}

export function cityEntries() {
  return urlMap.cityPages.map((c) => {
    const [, service, city] = c.route.split("/");
    return { ...c, service, city };
  });
}

export function getServiceDoc(slug: string) {
  const source = HUB_SOURCE[slug];
  if (!source) return null;
  const page = loadPage(source);
  const name = titleCase(slug);
  const paras = cleanParagraphs(page?.text || "", 12);
  return {
    slug,
    name,
    h1: `${name} in Orange County`,
    title: metaTitle(`${name} in Orange County, CA`),
    description: composeMeta(
      [`${name} in Irvine and across Orange County.`, "IICRC-certified technicians, Google Guaranteed."],
      [
        "Same-day openings and upfront quotes. Call (949) 992-3299.",
        "Upfront quotes. Call (949) 992-3299.",
        "Call (949) 992-3299.",
      ],
    ),
    paragraphs: paras,
    faqs: topUpFaqs(onTopicFaqs(slug, extractFaqs(page?.text || "")), name, "Orange County", slug),
    cities: cityEntries().filter((c) => c.service === slug),
  };
}

export function getCityDoc(service: string, city: string) {
  const entry = cityEntries().find((c) => c.service === service && c.city === city);
  if (!entry) return null;
  const serviceName = titleCase(service);
  const cityName = titleCase(city);
  const page = entry.source ? loadPage(entry.source) : null;
  const rewriteHard = entry.rewrite === "required" || entry.rewrite === "new-write";
  const sourceParas = cleanParagraphs(page?.text || "", rewriteHard ? 8 : 12);
  const intro = cityIntro(serviceName, cityName);
  const extra =
    entry.rewrite === "new-write"
      ? [
          `${cityName} homes pick up beach sand, salt air, and everyday soil that settles into carpet fibers. Our truck-mounted hot-water extraction lifts that soil without leaving a sticky residue.`,
          `If you need air duct cleaning in ${cityName}, that lives on its own page so Google and customers are not sent to the wrong service.`,
        ]
      : [];
  const body = [intro, ...extra, ...sourceParas.filter((p) => !/expert boat|yacht cleaning|leather couch cleaning in/i.test(p))];
  if (body.length < 4) {
    body.push(...cityDetail(serviceName, cityName, serviceBlurb(service, serviceName)));
  }

  return {
    service,
    city,
    serviceName,
    cityName,
    h1: `${serviceName} in ${cityName}, CA`,
    title: metaTitle(`${serviceName} in ${cityName}, CA`),
    description: composeMeta(
      [`${serviceName} in ${cityName}, CA.`, "IICRC-certified technicians, Google Guaranteed, upfront on-site quotes."],
      [
        "Same-day and next-day openings. Call (949) 992-3299.",
        "Same-day openings. Call (949) 992-3299.",
        "Call (949) 992-3299.",
      ],
    ),
    rewrite: entry.rewrite,
    paragraphs: body,
    faqs: topUpFaqs(onTopicFaqs(service, extractFaqs(page?.text || "")), serviceName, cityName, service),
  };
}

// Filtering off-topic questions can leave a page with one or none, so fall back
// to the service-and-city set without duplicating a question we already have.
function topUpFaqs(
  faqs: { q: string; a: string }[],
  serviceName: string,
  place: string,
  slug: string,
  min = 3,
) {
  if (faqs.length >= min) return faqs;
  const seen = new Set(faqs.map((f) => f.q.toLowerCase().replace(/\W+/g, "")));
  for (const f of cityFaqs(serviceName, place, serviceBlurb(slug, serviceName))) {
    if (faqs.length >= min + 1) break;
    if (seen.has(f.q.toLowerCase().replace(/\W+/g, ""))) continue;
    faqs.push(f);
  }
  return faqs;
}

export function getUtility(slug: "home" | "about-us" | "contact" | "locations") {
  return loadPage(slug);
}

export function getPosts() {
  const dir = join(ROOT, "content/posts");
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => readJson<WpPage>(`content/posts/${f}`))
    .sort((a, b) => a.title.localeCompare(b.title));
}

export function getPost(slug: string) {
  try {
    return readJson<WpPage>(`content/posts/${slug}.json`);
  } catch {
    return null;
  }
}

export function blogTitle(post: WpPage) {
  const slug = post.slug;
  const overrides: Record<string, string> = {
    "air-duct-cleaning-tustin-ca": "Air Duct Cleaning in Tustin, CA",
    "carpet-cleaning-air-quality-lake-forest-ca": "Carpet Cleaning and Air Quality in Lake Forest, CA",
    "curtain-cleaning-tips-for-lasting-elegance": "Curtain and Drape Cleaning Tips",
    "water-damage-restoration-in-irvine-ca": "Water Damage Restoration in Irvine, CA",
    "7-powerful-tips-cleaning-outdoor-furniture": "Outdoor Furniture Cleaning Tips for Orange County",
    "premium-sofa-and-couch-cleaning-yorba-linda": "Sofa and Couch Cleaning in Yorba Linda",
  };
  if (overrides[slug]) return overrides[slug];
  const t = (post.seo?.title || post.title || "").replace(/&amp;/g, "&");
  // The audit flagged superlative stacks, so they come out of titles too.
  return t
    .replace(/#\s?1\s*/gi, "")
    .replace(/\s*\|\s*[^|]*\b(trusted|best|top[- ]rated|5[- ]star)\b[^|]*$/i, "")
    .replace(/\b(best|top[- ]rated|trusted|premium)\s+/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, 70);
}

export function allIndexRoutes() {
  return [
    "/",
    "/about/",
    "/contact/",
    "/locations/",
    "/blog/",
    "/privacy-policy/",
    "/terms/",
    "/sms-terms/",
    ...serviceSlugs().map((s) => `/${s}/`),
    ...cityEntries().map((c) => `/${c.service}/${c.city}/`),
    ...getPosts().map((p) => `/blog/${p.slug}/`),
  ];
}
