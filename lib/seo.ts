import type { Metadata } from "next";
import { site } from "./site";

export const OG_IMAGE = {
  url: "/og.webp",
  width: 1200,
  height: 630,
  alt: "Carpet & Duct Cleaning — carpet and air duct cleaning in Irvine and Orange County",
} as const;

export function pageMeta({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: site.name,
      title,
      description,
      url: path,
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE.url],
    },
  };
}
