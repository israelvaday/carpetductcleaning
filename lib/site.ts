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
  street: "191 Pinestone",
  postalCode: "92604",
  email: "info@carpetductcleaning.com",
  jobs: "10,000+",
  rating: "4.9",
  reviewCount: "311",
} as const;

/** Profile URLs from the previous site's social icon row. */
export const socialLinks = [
  { name: "Facebook", href: "https://www.facebook.com/carpetductcleaning", color: "#1877F2", ink: "#ffffff" },
  { name: "Instagram", href: "https://instagram.com/carpet.duct.cleaning/", color: "#E1306C", ink: "#ffffff" },
  { name: "X", href: "https://x.com/Carpet_Duct_OC", color: "#ffffff", ink: "#0b2237" },
  { name: "Yelp", href: "https://www.yelp.com/biz/carpet-and-duct-cleaning-irvine-2", color: "#D32323", ink: "#ffffff" },
  { name: "LinkedIn", href: "https://www.linkedin.com/in/shomron-siso-1b77912ab/", color: "#0A66C2", ink: "#ffffff" },
  {
    name: "Thumbtack",
    href: "https://www.thumbtack.com/ca/irvine/carpet-cleaning/carpet-duct-cleaning/service/534053556677681166",
    color: "#009FD9",
    ink: "#ffffff",
  },
  { name: "TikTok", href: "https://www.tiktok.com/@carpetductcleaning", color: "#111111", ink: "#ffffff" },
  { name: "Google", href: "https://maps.google.com/?cid=17628681850478476219", color: "#4285F4", ink: "#ffffff" },
  { name: "Pinterest", href: "https://pin.it/7As2NFFMW", color: "#E60023", ink: "#ffffff" },
  { name: "YouTube", href: "https://www.youtube.com/channel/UCH6zvRdIYTxYJIhM6IQOJ8A", color: "#FF0033", ink: "#ffffff" },
  { name: "Nextdoor", href: "https://nextdoor.com/pages/carpet-and-duct-cleaning-irvine-ca/", color: "#8ED500", ink: "#0b2237" },
] as const;

export function siteUrl() {
  if (process.env.GITHUB_PAGES === "true") {
    return "https://israelvaday.github.io/carpetductcleaning";
  }
  return process.env.NEXT_PUBLIC_SITE_URL || "https://carpetductcleaning.com";
}

export const moneyServices = [
  { href: "/carpet-cleaning/", label: "Carpet Cleaning" },
  { href: "/air-duct-cleaning/", label: "Air Duct Cleaning" },
  { href: "/drape-cleaning/", label: "Curtain Cleaning" },
  { href: "/outdoor-furniture-cleaning/", label: "Outdoor Cushion Cleaning" },
  { href: "/water-damage-restoration/", label: "Water Damage" },
  { href: "/dryer-vent-cleaning/", label: "Dryer Vent Cleaning" },
  { href: "/area-rug-cleaning/", label: "Area Rugs" },
  { href: "/upholstery-cleaning/", label: "Upholstery" },
  { href: "/hardwood-floor-cleaning/", label: "Hardwood Floors" },
  { href: "/commercial-carpet-cleaning/", label: "Commercial" },
] as const;
