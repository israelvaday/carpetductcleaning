import type { Metadata } from "next";
import { LegalPage } from "@/components/legal";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "Terms of Service | Carpet & Duct Cleaning Irvine CA" },
  description:
    "Service terms for Carpet & Duct Cleaning in Irvine, CA: how quotes are confirmed on site, scheduling, payment, stain expectations, and property care.",
  alternates: { canonical: "/terms/" },
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      intro={`These terms apply to cleaning services booked with ${site.name} by phone, text, email, or through this website. Booking a service means you agree to them.`}
      sections={[
        {
          heading: "Quotes and pricing",
          body: [
            "Prices given by phone or online are estimates based on what you describe. Your technician confirms the final price on site before any work starts, and work begins only after you approve it.",
          ],
        },
        {
          heading: "Scheduling and access",
          body: [
            "Please give us as much notice as you can if you need to reschedule. We need safe access to the work area, running water, and electricity. Small items and breakables should be picked up before we arrive.",
          ],
        },
        {
          heading: "Results",
          body: [
            "We use professional methods suited to each surface, but some stains, dyes, burns, pet urine damage, and wear are permanent. Your technician will point out anything that may not fully come out before starting.",
            "If you are not happy with an area we cleaned, contact us promptly so we can come back and look at it.",
          ],
        },
        {
          heading: "Property care",
          body: [
            "We move light furniture with care and place protective tabs where needed. We are not responsible for pre-existing damage, loose seams, weak fibers, or items that are unstable or already broken. We are licensed and insured.",
          ],
        },
        {
          heading: "Payment",
          body: [
            "Payment is due when the work is complete unless we agree otherwise in writing for commercial or multi-visit jobs.",
          ],
        },
        {
          heading: "This website",
          body: [
            "Content on carpetductcleaning.com is general information, not a binding offer. We may update these terms; the date above shows the latest version.",
          ],
        },
      ]}
    />
  );
}
