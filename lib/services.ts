export const SERVICE_BLURB: Record<string, string> = {
  "carpet-cleaning": "Truck-mounted hot-water extraction that lifts embedded soil and dries in hours, not days.",
  "air-duct-cleaning": "HEPA-powered duct and vent cleaning that pulls dust and dander out of your HVAC system.",
  "dryer-vent-cleaning": "Clear the lint line that slows your dryer and raises fire risk.",
  "water-damage-restoration": "Fast extraction, drying, and moisture mapping after a leak or flood.",
  "area-rug-cleaning": "Off-site wash, controlled drying, and fringe detail for wool and synthetic rugs.",
  "oriental-rug-cleaning": "Gentle hand washing for Persian, Oriental, and silk rugs that need dye-safe care.",
  "rug-pickup": "We pick up your rug, clean it at our facility, and deliver it back.",
  "upholstery-cleaning": "Fabric-safe extraction for sofas, sectionals, chairs, and dining seats.",
  "couch-cleaning": "Deep cleaning for couches and sectionals, including cushions and crevices.",
  "leather-furniture-cleaning": "Clean and condition leather so it stays soft instead of drying and cracking.",
  "microfiber-couch-cleaning": "Microfiber-specific method that lifts body oils without water rings.",
  "hardwood-floor-cleaning": "Deep clean and polish that removes grime without stripping the finish.",
  "tile-and-grout-cleaning": "Pressure cleaning that pulls grease and soil out of porous grout lines.",
  "vinyl-floor-cleaning": "Machine scrub for LVP and sheet vinyl that restores the original sheen.",
  "natural-stone-cleaning": "Marble, travertine, and granite cleaning, honing, and sealing.",
  "pet-stain-odor": "Enzyme treatment that neutralizes urine at the pad, not just the surface.",
  "commercial-carpet-cleaning": "After-hours carpet service for offices, retail, and property managers.",
  "commercial-air-duct-cleaning": "HVAC and duct sanitizing for commercial buildings and multi-unit properties.",
  commercial: "One crew for carpet, hard floors, upholstery, and air quality in your building.",
  "car-seat-cleaning": "Interior detailing for car, truck, and RV upholstery and carpet.",
  "drape-cleaning": "On-site drape and curtain cleaning with no take-down damage.",
  "outdoor-furniture-cleaning": "Patio cushions and frames cleaned and protected against sun and salt air.",
  "encapsulation-carpet-cleaning": "Low-moisture method for high-traffic areas that need to be walked on quickly.",
  "emergency-cleaning": "Same-day response for overflows, sewage backups, and storm damage.",
  "floor-cleaning": "Whole-home hard floor cleaning across tile, vinyl, wood, and stone.",
};

export function serviceBlurb(slug: string, name: string) {
  return SERVICE_BLURB[slug] || `Professional ${name.toLowerCase()} across Irvine and Orange County.`;
}

export const SERVICE_GROUPS: { title: string; slugs: string[] }[] = [
  {
    title: "Carpet & floors",
    slugs: [
      "carpet-cleaning",
      "encapsulation-carpet-cleaning",
      "pet-stain-odor",
      "hardwood-floor-cleaning",
      "tile-and-grout-cleaning",
      "vinyl-floor-cleaning",
      "natural-stone-cleaning",
      "floor-cleaning",
    ],
  },
  {
    title: "Air & vents",
    slugs: ["air-duct-cleaning", "dryer-vent-cleaning", "commercial-air-duct-cleaning"],
  },
  {
    title: "Rugs",
    slugs: ["area-rug-cleaning", "oriental-rug-cleaning", "rug-pickup"],
  },
  {
    title: "Furniture & interiors",
    slugs: [
      "upholstery-cleaning",
      "couch-cleaning",
      "leather-furniture-cleaning",
      "microfiber-couch-cleaning",
      "drape-cleaning",
      "outdoor-furniture-cleaning",
      "car-seat-cleaning",
    ],
  },
  {
    title: "Commercial & emergency",
    slugs: ["commercial", "commercial-carpet-cleaning", "water-damage-restoration", "emergency-cleaning"],
  },
];

export const PROCESS_STEPS = [
  {
    title: "Inspect and quote",
    body: "We walk the job with you, test the fibers or check the ductwork, and give an itemized price before anything starts.",
  },
  {
    title: "Protect and clean",
    body: "Corners and doorways get protected, then we clean with commercial equipment and EPA Safer Choice solutions.",
  },
  {
    title: "Dry and walk through",
    body: "Air movers speed up drying, then we walk the finished work with you before we pack up.",
  },
];

// Filler for city pages whose WordPress source was a thin stub. Every line has
// to stay true for any city, so nothing here invents local detail.
export function cityDetail(serviceName: string, cityName: string, blurb: string) {
  return [
    `${blurb} In ${cityName} that usually means an on-site walkthrough first: we look at the soil level, the fiber or surface type, and anything that needs pre-treatment, then price the job before we start.`,
    `Coastal Orange County air carries salt and fine grit indoors, and inland neighborhoods pick up dust from dry months. Both settle into soft surfaces and HVAC systems, which is why ${serviceName.toLowerCase()} here is usually about removing built-up soil rather than a surface refresh.`,
    `Booking is straightforward. Call (949) 992-3299 with your address in ${cityName} and roughly how much area is involved, and we will give you a price range on the phone and the next open slot — often the same or next day.`,
  ];
}

// The WordPress city pages covered every service in one document, so an
// unfiltered extraction drops duct and water-damage questions onto a carpet
// page. Match on the vocabulary each service actually uses.
const SERVICE_TOPICS: Record<string, RegExp> = {
  "carpet-cleaning": /carpet/i,
  "encapsulation-carpet-cleaning": /encapsulat|low.moisture/i,
  "pet-stain-odor": /pet stain|odou?r|urine|accident/i,
  "hardwood-floor-cleaning": /hardwood|wood floor/i,
  "tile-and-grout-cleaning": /tile|grout/i,
  "vinyl-floor-cleaning": /vinyl|\blvp\b|linoleum/i,
  "natural-stone-cleaning": /marble|travertine|granite|natural stone|limestone/i,
  "floor-cleaning": /hard floor|floor cleaning/i,
  "air-duct-cleaning": /air duct|ductwork|\bducts?\b|\bhvac\b|air quality/i,
  "dryer-vent-cleaning": /dryer vent|\blint\b/i,
  "commercial-air-duct-cleaning": /commercial.{0,30}duct|duct.{0,30}commercial/i,
  "area-rug-cleaning": /area rug|\brugs?\b/i,
  "oriental-rug-cleaning": /oriental|persian|silk rug|wool rug/i,
  "rug-pickup": /pick ?up|drop ?off/i,
  "upholstery-cleaning": /upholster|sofa|couch|cushion|fabric/i,
  "couch-cleaning": /couch|sectional|sofa/i,
  "leather-furniture-cleaning": /leather/i,
  "microfiber-couch-cleaning": /microfib/i,
  "drape-cleaning": /drape|curtain/i,
  "outdoor-furniture-cleaning": /outdoor|patio/i,
  "car-seat-cleaning": /car seat|vehicle|\brv\b|\bauto\b/i,
  commercial: /commercial|office|property manager|retail/i,
  "commercial-carpet-cleaning": /commercial.{0,30}carpet|carpet.{0,30}commercial/i,
  "water-damage-restoration": /water damage|flood|\bleak|restoration|moisture/i,
  "emergency-cleaning": /emergency|sewage|overflow|burst/i,
};

// Drop questions that read like marketing CTAs or lean on the superlatives the
// audit told us to remove.
const BAD_FAQ = /#\s?1\b|most trusted|best\s+\w+\s+(company|service|cleaning)|top[- ]rated|5[- ]star|provides best|why choose us/i;

// Keep a question when it is about this service or is service-neutral, and drop
// it when it clearly belongs to a different service or reads like an ad.
export function onTopicFaqs<T extends { q: string; a: string }>(slug: string, faqs: T[]) {
  const own = SERVICE_TOPICS[slug];
  const others = Object.entries(SERVICE_TOPICS)
    .filter(([s]) => s !== slug)
    .map(([, re]) => re);
  return faqs.filter((f) => {
    const text = `${f.q} ${f.a}`;
    if (BAD_FAQ.test(text)) return false;
    if (own?.test(text)) return true;
    return !others.some((re) => re.test(text));
  });
}

// Used when filtering leaves a page with too few questions. Nothing here claims
// anything that is not true in every city we serve.
export function cityFaqs(serviceName: string, cityName: string, blurb: string) {
  const name = serviceName.toLowerCase();
  return [
    {
      q: `How much does ${name} cost in ${cityName}?`,
      a: `Price depends on the area covered and how soiled it is, so we quote on-site before any work starts. Call (949) 992-3299 with your ${cityName} address and rough square footage and we will give you a range on the phone.`,
    },
    {
      q: `How soon can you get to a job in ${cityName}?`,
      a: `We hold same-day and next-day openings for ${cityName} and the rest of Orange County. The earlier in the day you call, the better the chance of a same-day slot.`,
    },
    {
      q: `What does your ${name} process involve?`,
      a: `${blurb} We inspect and quote first, protect corners and doorways, clean with commercial equipment and EPA Safer Choice products, then walk the finished work with you before we pack up.`,
    },
    {
      q: `Are your technicians certified and insured?`,
      a: `Yes. Our technicians are IICRC-certified and we are Google Guaranteed with a BBB A+ rating. We have worked across Irvine and Orange County since 2013.`,
    },
  ];
}

export const PROOF_POINTS = [
  "IICRC-certified technicians",
  "Google Guaranteed and BBB A+",
  "EPA Safer Choice products, safe for kids and pets",
  "Itemized quote on-site, no bait-and-switch",
  "Same-day and next-day openings",
];
