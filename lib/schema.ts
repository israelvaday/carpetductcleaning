import { getGoogleProfile, openingHoursSpecification } from "./google-profile";
import { site, siteUrl, socialLinks } from "./site";

export function businessNode() {
  const profile = getGoogleProfile();
  return {
    "@context": "https://schema.org",
    "@type": "CleaningService",
    "@id": `${siteUrl()}/#business`,
    name: site.name,
    url: `${siteUrl()}/`,
    image: `${siteUrl()}/og.jpg`,
    logo: {
      "@type": "ImageObject",
      url: `${siteUrl()}/logo.png`,
      width: 1266,
      height: 268,
    },
    telephone: "+19499923299",
    foundingDate: String(site.foundingYear),
    areaServed: { "@type": "AdministrativeArea", name: "Orange County, CA" },
    address: {
      "@type": "PostalAddress",
      streetAddress: profile?.street || site.street,
      addressLocality: profile?.city || site.city,
      addressRegion: profile?.regionCode || site.region,
      postalCode: profile?.postalCode || site.postalCode,
      addressCountry: profile?.country || "US",
    },
    sameAs: sameAsLinks(profile?.mapsUrl),
    // Hours, pin, and Maps URL from the same Place Details call (content/google-profile.json).
    // Google's place types include an off-base "laundry" label, so the @type stays CleaningService.
    ...profileSignals(profile),
  };
}

function sameAsLinks(maps?: string) {
  return socialLinks.map((s) => (s.name === "Google" && maps ? maps : s.href));
}

function profileSignals(profile: ReturnType<typeof getGoogleProfile>) {
  if (!profile) return {};
  const hours = openingHoursSpecification(profile.hours);
  return {
    geo: {
      "@type": "GeoCoordinates",
      latitude: profile.latitude,
      longitude: profile.longitude,
    },
    hasMap: profile.mapsUrl,
    ...(hours.length ? { openingHoursSpecification: hours } : {}),
    identifier: [
      { "@type": "PropertyValue", propertyID: "googlePlaceId", value: profile.placeId },
      ...(profile.plusCode
        ? [{ "@type": "PropertyValue", propertyID: "plusCode", value: profile.plusCode }]
        : []),
    ],
    ...(profile.wheelchairAccessibleParking
      ? {
          amenityFeature: {
            "@type": "LocationFeatureSpecification",
            name: "Wheelchair-accessible parking",
            value: true,
          },
        }
      : {}),
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+19499923299",
      contactType: "customer service",
      areaServed: "Orange County, CA",
      availableLanguage: "English",
      ...(hours.length ? { hoursAvailable: hours } : {}),
    },
  };
}

export function jsonLd(data: Record<string, unknown> | Record<string, unknown>[]) {
  const payload = Array.isArray(data)
    ? { "@context": "https://schema.org", "@graph": data }
    : data["@context"]
      ? data
      : { "@context": "https://schema.org", ...data };
  return {
    __html: JSON.stringify(payload),
  };
}

export function breadcrumbs(items: { name: string; href: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${siteUrl()}${item.href}`,
    })),
  };
}

export function blogPosting(opts: {
  title: string;
  description: string;
  path: string;
  date?: string;
  image?: string;
}) {
  const published = opts.date?.replace(" ", "T");
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: opts.title,
    description: opts.description,
    mainEntityOfPage: `${siteUrl()}${opts.path}`,
    ...(published ? { datePublished: published } : {}),
    ...(opts.image ? { image: opts.image.startsWith("http") ? opts.image : `${siteUrl()}${opts.image}` } : {}),
    author: { "@type": "Organization", name: site.name, url: `${siteUrl()}/` },
    publisher: { "@id": `${siteUrl()}/#business` },
  };
}

export function faqLd(faqs: { q: string; a: string }[]) {
  if (!faqs.length) return null;
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
