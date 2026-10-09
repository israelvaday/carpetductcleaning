import type { Metadata, Viewport } from "next";
import { Fraunces, Outfit } from "next/font/google";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { QuoteProvider } from "@/components/quote-dialog";
import { StickyActions } from "@/components/sticky-actions";
import { JsonLd } from "@/components/json-ld";
import { businessNode } from "@/lib/schema";
import { OG_IMAGE } from "@/lib/seo";
import { site, siteUrl } from "@/lib/site";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const defaultTitle = "Carpet Cleaning in Irvine, CA | Air Duct & Rug Cleaning";
const defaultDescription =
  "Google Guaranteed carpet and air duct cleaning in Irvine, CA since 2013. BBB A+, same-day openings across Orange County. Call (949) 992-3299.";

export const viewport: Viewport = {
  themeColor: "#0b2237",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  applicationName: site.shortName,
  title: {
    default: defaultTitle,
    template: "%s | Carpet & Duct Cleaning",
  },
  description: defaultDescription,
  robots: process.env.GITHUB_PAGES === "true" ? { index: false, follow: false } : { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: site.name,
    title: defaultTitle,
    description: defaultDescription,
    url: "/",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: [OG_IMAGE.url],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} ${fraunces.variable}`}>
      <body className="min-h-screen antialiased">
        <JsonLd data={businessNode()} />
        <QuoteProvider>
          <Header />
          <main>{children}</main>
          <Footer />
          <StickyActions />
        </QuoteProvider>
      </body>
    </html>
  );
}
