import { getReviews } from "./reviews";
import { site, siteUrl } from "./site";

export function businessNode() {
  return {
    "@type": "CleaningService",
    "@id": `${siteUrl()}/#business`,
    name: site.name,
    url: `${siteUrl()}/`,
    telephone: "+19499923299",
    foundingDate: String(site.foundingYear),
    areaServed: { "@type": "AdministrativeArea", name: "Orange County, CA" },
    address: {
      "@type": "PostalAddress",
      streetAddress: "191 Pinestone",
      addressLocality: site.city,
      addressRegion: site.region,
      postalCode: "92604",
      addressCountry: "US",
    },
    // Real numbers pulled from Google Places at build time (content/reviews.json).
    ...aggregateRating(),
  };
}

function aggregateRating() {
  const r = getReviews();
  if (!r) return {}; // not fetched yet — omit rather than claim numbers
  return {
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: String(r.rating),
      reviewCount: String(r.totalRatings),
    },
  };
}

export function jsonLd(data: Record<string, unknown> | Record<string, unknown>[]) {
  return {
    __html: JSON.stringify(data),
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
