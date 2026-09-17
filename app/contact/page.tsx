import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Call ${site.phone} or request a quote for carpet and air duct cleaning in Orange County.`,
  alternates: { canonical: "/contact/" },
};

export default function ContactPage() {
  return (
    <article className="max-w-xl">
      <h1 className="text-4xl font-semibold">Contact</h1>
      <p className="mt-3 text-navy/70">
        Irvine and Orange County. Same-day openings. Call or send the form — we reply on business days.
      </p>
      <p className="mt-6 text-2xl font-semibold">
        <a href={site.phoneHref}>{site.phone}</a>
      </p>
      <form className="mt-8 space-y-3" action={`mailto:${site.email}`} method="get">
        <input name="subject" type="hidden" value="Quote request" />
        <label className="block text-sm font-medium">
          Name
          <input required name="name" className="mt-1 w-full rounded-lg border border-navy/15 bg-white px-3 py-2" />
        </label>
        <label className="block text-sm font-medium">
          Phone
          <input required name="body" className="mt-1 w-full rounded-lg border border-navy/15 bg-white px-3 py-2" />
        </label>
        <button className="rounded-full bg-teal px-5 py-2.5 font-semibold text-white" type="submit">
          Email a quote request
        </button>
      </form>
      <p className="mt-6 text-xs text-navy/55">
        By submitting you agree to our{" "}
        <a className="underline" href="/privacy-policy/">
          Privacy Policy
        </a>
        ,{" "}
        <a className="underline" href="/terms/">
          Terms
        </a>
        , and{" "}
        <a className="underline" href="/sms-terms/">
          SMS terms
        </a>
        .
      </p>
    </article>
  );
}
