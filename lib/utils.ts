import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function titleCase(slug: string) {
  const special: Record<string, string> = {
    "anaheim-hills": "Anaheim Hills",
    "buena-park": "Buena Park",
    "corona-del-mar": "Corona del Mar",
    "costa-mesa": "Costa Mesa",
    "coto-de-caza": "Coto de Caza",
    "dana-point": "Dana Point",
    "dove-canyon": "Dove Canyon",
    "east-irvine": "East Irvine",
    "foothill-ranch": "Foothill Ranch",
    "fountain-valley": "Fountain Valley",
    "garden-grove": "Garden Grove",
    "huntington-beach": "Huntington Beach",
    "ladera-ranch": "Ladera Ranch",
    "laguna-beach": "Laguna Beach",
    "laguna-hills": "Laguna Hills",
    "santa-ana": "Santa Ana",
    "seal-beach": "Seal Beach",
    "trabuco-canyon": "Trabuco Canyon",
    "tustin-ranch": "Tustin Ranch",
    "aliso-viejo": "Aliso Viejo",
    "yorba-linda": "Yorba Linda",
    "air-duct-cleaning": "Air Duct Cleaning",
    "carpet-cleaning": "Carpet Cleaning",
    "dryer-vent-cleaning": "Dryer Vent Cleaning",
    "water-damage-restoration": "Water Damage Restoration",
    "area-rug-cleaning": "Area Rug Cleaning",
    "oriental-rug-cleaning": "Oriental Rug Cleaning",
    "rug-pickup": "Rug Pickup & Drop-Off",
    "upholstery-cleaning": "Upholstery Cleaning",
    "couch-cleaning": "Couch & Sectional Cleaning",
    "leather-furniture-cleaning": "Leather Furniture Cleaning",
    "microfiber-couch-cleaning": "Microfiber Couch Cleaning",
    "hardwood-floor-cleaning": "Hardwood Floor Cleaning",
    "tile-and-grout-cleaning": "Tile and Grout Cleaning",
    "vinyl-floor-cleaning": "Vinyl Floor Cleaning",
    "natural-stone-cleaning": "Natural Stone Cleaning",
    "pet-stain-odor": "Pet Stain & Odor Treatment",
    "commercial-carpet-cleaning": "Commercial Carpet Cleaning",
    "commercial-air-duct-cleaning": "Commercial Air Duct Cleaning",
    "car-seat-cleaning": "Car Seat Cleaning",
    "drape-cleaning": "Drape & Curtain Cleaning",
    "outdoor-furniture-cleaning": "Outdoor Furniture Cleaning",
    "encapsulation-carpet-cleaning": "Encapsulation Carpet Cleaning",
    "emergency-cleaning": "Emergency Cleaning",
    "floor-cleaning": "Floor Cleaning",
    commercial: "Commercial Cleaning",
  };
  if (special[slug]) return special[slug];
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
