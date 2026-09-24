import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "SMS Messaging Terms and Conditions | Carpet & Duct Cleaning" },
  description:
    "SMS terms for Carpet & Duct Cleaning text messages: what we send, how often, message and data rates, and how to reply STOP to opt out or HELP for help.",
  alternates: { canonical: "/sms-terms/" },
};

export default function SmsPage() {
  return (
    <LegalPage
      title="SMS terms"
      intro={`${site.name} sends text messages to customers who give us a mobile number and agree to be contacted about their quote or appointment.`}
      sections={[
        {
          heading: "What we send",
          body: [
            "Quote follow-ups, appointment confirmations and reminders, arrival updates, and post-service check-ins. Messages may be sent by an automated system.",
          ],
        },
        {
          heading: "Frequency and cost",
          body: [
            "Message frequency varies with your booking, typically a few messages per job. Message and data rates may apply. Consent to receive texts is not a condition of purchase.",
          ],
        },
        {
          heading: "Opting out and help",
          body: [
            "Reply STOP to any message to stop receiving texts; we will send one confirmation and then no more. Reply HELP for help, or call us at " +
              site.phone +
              ". U.S. mobile numbers only. Carriers are not liable for delayed or undelivered messages.",
          ],
        },
        {
          heading: "Privacy",
          body: [
            <>
              Mobile numbers and opt-in consent are never sold or shared with third parties for marketing. See our{" "}
              <Link className="underline" href="/privacy-policy/">Privacy Policy</Link> and{" "}
              <Link className="underline" href="/terms/">Terms of Service</Link>.
            </>,
          ],
        },
      ]}
    />
  );
}
