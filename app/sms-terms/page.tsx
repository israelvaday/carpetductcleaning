import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SMS terms",
  alternates: { canonical: "/sms-terms/" },
};

export default function SmsPage() {
  return (
    <article className="max-w-2xl">
      <h1 className="text-4xl font-semibold">SMS terms</h1>
      <p className="mt-4 text-navy/75">
        By opting in you agree to receive recurring marketing text messages, which may be automated, from Carpet & Duct
        Cleaning. Consent is not a condition of purchase. Message frequency varies. Message and data rates may apply.
        Reply HELP for help and STOP to cancel. U.S. mobile numbers only.
      </p>
    </article>
  );
}
