import type { Metadata } from "next";
import { Section } from "@/components/ui";

export const metadata: Metadata = {
  title: { absolute: "SMS Terms and Conditions | Carpet & Duct Cleaning" },
  alternates: { canonical: "/sms-terms/" },
};

export default function SmsPage() {
  return (
    <Section tone="light">
      <h1 className="text-4xl font-semibold text-navy">SMS terms</h1>
      <p className="prose-body mt-6 max-w-2xl">
        By opting in you agree to receive recurring marketing text messages, which may be automated, from Carpet & Duct
        Cleaning. Consent is not a condition of purchase. Message frequency varies. Message and data rates may apply.
        Reply HELP for help and STOP to cancel. U.S. mobile numbers only.
      </p>
    </Section>
  );
}
