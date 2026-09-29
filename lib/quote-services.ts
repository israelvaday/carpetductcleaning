export const QUOTE_SERVICES = [
  "carpet-cleaning",
  "air-duct-cleaning",
  "upholstery-cleaning",
  "area-rug-cleaning",
  "tile-and-grout-cleaning",
  "hardwood-floor-cleaning",
  "water-damage-restoration",
  "dryer-vent-cleaning",
  "commercial-carpet-cleaning",
] as const;

export function serviceFromPath(pathname: string) {
  const first = pathname.split("/").filter(Boolean)[0] || "";
  return (QUOTE_SERVICES as readonly string[]).includes(first) ? first : "";
}
