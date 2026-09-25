import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { JsonLd } from "@/components/json-ld";
import { businessNode } from "@/lib/schema";
import { siteUrl } from "@/lib/site";
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

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "Carpet Cleaning in Irvine, CA | Air Duct & Rug Cleaning",
    template: "%s | Carpet & Duct Cleaning",
  },
  description:
    "Google Guaranteed carpet cleaning and air duct cleaning in Irvine and Orange County. IICRC-certified crews, upfront quotes. Call (949) 992-3299.",
  robots: process.env.GITHUB_PAGES === "true" ? { index: false, follow: false } : { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} ${fraunces.variable}`}>
      <body className="min-h-screen antialiased">
        <JsonLd data={businessNode()} />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
