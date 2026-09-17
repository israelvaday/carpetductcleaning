export const site = {
  name: "Carpet And Duct Cleaning",
  shortName: "Carpet & Duct Cleaning",
  tagline: "Irvine’s Google Guaranteed carpet and air duct cleaning",
  phone: "(949) 992-3299",
  phoneHref: "tel:+19499923299",
  foundingYear: 2013,
  city: "Irvine",
  region: "CA",
  area: "Orange County",
  email: "info@carpetductcleaning.com",
  jobs: "10,000+",
  rating: "4.9",
  reviewCount: "350",
} as const;

export function siteUrl() {
  if (process.env.GITHUB_PAGES === "true") {
    return "https://israelvaday.github.io/carpetductcleaning";
  }
  return process.env.NEXT_PUBLIC_SITE_URL || "https://carpetductcleaning.com";
}

export const moneyServices = [
  { href: "/carpet-cleaning/", label: "Carpet Cleaning" },
  { href: "/air-duct-cleaning/", label: "Air Duct Cleaning" },
  { href: "/dryer-vent-cleaning/", label: "Dryer Vent Cleaning" },
  { href: "/water-damage-restoration/", label: "Water Damage" },
  { href: "/area-rug-cleaning/", label: "Area Rugs" },
  { href: "/upholstery-cleaning/", label: "Upholstery" },
  { href: "/hardwood-floor-cleaning/", label: "Hardwood Floors" },
  { href: "/commercial-carpet-cleaning/", label: "Commercial" },
] as const;
