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

export const PROOF_POINTS = [
  "IICRC-certified technicians",
  "Google Guaranteed and BBB A+",
  "EPA Safer Choice products, safe for kids and pets",
  "Itemized quote on-site, no bait-and-switch",
  "Same-day and next-day openings",
];
