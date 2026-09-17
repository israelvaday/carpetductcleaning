import type { Metadata } from "next";
import { Section } from "@/components/ui";

export const metadata: Metadata = {
  title: { absolute: "Privacy Policy | Carpet & Duct Cleaning Irvine, CA" },
  alternates: { canonical: "/privacy-policy/" },
};

export default function PrivacyPage() {
  return (
    <Section tone="light">
      <h1 className="text-4xl font-semibold text-navy">Privacy Policy</h1>
      <p className="prose-body mt-6 max-w-2xl">
        Carpet And Duct Cleaning in Irvine, CA collects name, phone, email, and address only to schedule service and
        send the texts or emails you request. We do not sell personal information. Call (949) 992-3299 with privacy
        questions.
      </p>
    </Section>
  );
}
