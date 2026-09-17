import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { JsonLd } from "@/components/json-ld";
import { businessNode } from "@/lib/schema";
import { siteUrl } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "Carpet Cleaning in Irvine, CA | Air Duct Cleaning",
    template: "%s | Carpet & Duct Cleaning",
  },
  description:
    "Google Guaranteed carpet cleaning and air duct cleaning in Irvine and Orange County. IICRC-certified crews, upfront quotes. Call (949) 992-3299.",
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <JsonLd data={businessNode()} />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
