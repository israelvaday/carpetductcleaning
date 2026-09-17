import type { Metadata } from "next";
import { Section } from "@/components/ui";

export const metadata: Metadata = {
  title: { absolute: "Terms of Service | Carpet & Duct Cleaning Irvine CA" },
  alternates: { canonical: "/terms/" },
};

export default function TermsPage() {
  return (
    <Section tone="light">
      <h1 className="text-4xl font-semibold text-navy">Terms</h1>
      <p className="prose-body mt-6 max-w-2xl">
        Quotes are confirmed on site. Work begins only after you approve the price. We are licensed and insured. These
        terms apply to services booked through carpetductcleaning.com.
      </p>
    </Section>
  );
}
