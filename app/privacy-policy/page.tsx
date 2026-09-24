import type { Metadata } from "next";
import { LegalPage } from "@/components/legal";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "Privacy Policy | Carpet & Duct Cleaning Irvine, CA" },
  description:
    "How Carpet & Duct Cleaning in Irvine, CA collects, uses, and protects the name, phone, email, and address you share when you request a cleaning quote.",
  alternates: { canonical: "/privacy-policy/" },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro={`${site.name} ("we", "us") provides carpet, upholstery, rug, floor, and air duct cleaning in Irvine and across ${site.area}, California. This policy explains what we collect when you contact us or use this website, and what we do with it.`}
      sections={[
        {
          heading: "What we collect",
          body: [
            "Details you give us: your name, phone number, email address, service address, and notes about the job (rooms, stains, pets, access).",
            "Basic technical data sent by your browser when you visit, such as pages viewed, device type, and approximate location. This site is hosted as static pages and does not use accounts or logins.",
          ],
        },
        {
          heading: "How we use it",
          body: [
            "To prepare quotes, schedule and confirm appointments, send reminders, follow up after a job, and answer your questions.",
            "To keep records of work performed, payments, and any warranty or re-service requests.",
          ],
        },
        {
          heading: "Text messages",
          body: [
            "If you give us a mobile number, we may text you about your quote and appointment. Reply STOP at any time to opt out. Your mobile number and opt-in consent are never sold or shared with third parties for their marketing.",
          ],
        },
        {
          heading: "Who we share it with",
          body: [
            "We do not sell personal information. We share it only with service providers that help us run the business, such as phone, email, scheduling, and payment tools, and only as needed to serve you, or when the law requires it.",
          ],
        },
        {
          heading: "Embedded services",
          body: [
            "Pages may include Google Maps and Google review content. Google may set its own cookies when those load; its use of data is covered by Google's privacy policy.",
          ],
        },
        {
          heading: "Your choices and California rights",
          body: [
            "You can ask what information we hold about you, ask us to correct or delete it, or opt out of texts and emails. California residents have these rights under the CCPA/CPRA. We will not treat you differently for using them.",
          ],
        },
        {
          heading: "Retention and security",
          body: [
            "We keep customer records only as long as needed for service history, accounting, and legal obligations, and we limit access to people who need it to do their jobs.",
          ],
        },
      ]}
    />
  );
}
