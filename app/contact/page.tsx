import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Clock, MapPin, Phone } from "lucide-react";
import { ImageHero } from "@/components/blocks";
import { JsonLd } from "@/components/json-ld";
import { CheckList, Section, SectionHead, TrustRow } from "@/components/ui";
import { img } from "@/lib/images";
import { breadcrumbs } from "@/lib/schema";
import { PROOF_POINTS } from "@/lib/services";
import { site, siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "Contact Carpet & Duct Cleaning | Quotes in Irvine" },
  description: `Call ${site.phone} or request a free quote for carpet, rug, upholstery, and air duct cleaning in Irvine and across Orange County, CA.`,
  alternates: { canonical: "/contact/" },
};

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={[
          {
            "@type": "ContactPage",
            "@id": `${siteUrl()}/contact/#page`,
            name: `Contact ${site.name}`,
            url: `${siteUrl()}/contact/`,
            about: { "@id": `${siteUrl()}/#business` },
          },
          breadcrumbs([
            { name: "Home", href: "/" },
            { name: "Contact", href: "/contact/" },
          ]),
        ]}
      />

      <ImageHero
        image={img("carpet-room")}
        breadcrumb={[{ name: "Home", href: "/" }, { name: "Contact" }]}
        eyebrow="Get a quote"
        title="Contact Carpet & Duct Cleaning"
        body={`Call ${site.phone} for the fastest answer, or send the form and we will reply on the next business day.`}
      />

      <Section tone="light">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <SectionHead eyebrow="Talk to us" title="Reach the crew directly" />
            <div className="mt-8 grid gap-5">
              <a href={site.phoneHref} className="flex items-start gap-4 rounded-2xl border border-line bg-sand p-5">
                <Phone className="mt-1 size-5 text-brand" />
                <span>
                  <span className="block text-sm font-semibold uppercase tracking-wide text-ink/55">Phone</span>
                  <span className="block text-2xl font-semibold text-navy">{site.phone}</span>
                </span>
              </a>
              <div className="flex items-start gap-4 rounded-2xl border border-line bg-sand p-5">
                <MapPin className="mt-1 size-5 text-brand" />
                <span>
                  <span className="block text-sm font-semibold uppercase tracking-wide text-ink/55">Area</span>
                  <span className="block font-medium text-navy">
                    {site.city}, {site.region} — serving {site.area}
                  </span>
                </span>
              </div>
              <div className="flex items-start gap-4 rounded-2xl border border-line bg-sand p-5">
                <Clock className="mt-1 size-5 text-brand" />
                <span>
                  <span className="block text-sm font-semibold uppercase tracking-wide text-ink/55">Hours</span>
                  <span className="block font-medium text-navy">
                    Monday to Saturday, with same-day and next-day openings
                  </span>
                </span>
              </div>
            </div>
            <div className="mt-8">
              <TrustRow />
            </div>
            <div className="relative mt-8 aspect-16/9 overflow-hidden rounded-2xl shadow-card">
              <Image
                src="/images/map.webp"
                alt="Orange County service area map"
                fill
                sizes="(min-width: 1024px) 30rem, 100vw"
                className="object-cover"
              />
            </div>
          </div>

          <div className="rounded-3xl border border-line bg-white p-6 shadow-lift md:p-8">
            <h2 className="text-2xl font-semibold text-navy">Request a quote</h2>
            <p className="mt-2 text-ink/70">
              Tell us the service, the city, and roughly how big the job is. We will come back with a price range and
              the next open slot.
            </p>
            <form className="mt-6 space-y-4" action={`mailto:${site.email}`} method="get">
              <input name="subject" type="hidden" value="Quote request" />
              <label className="block text-sm font-semibold text-navy">
                Name
                <input
                  required
                  name="name"
                  className="mt-1.5 w-full rounded-xl border border-line bg-sand px-4 py-3 font-normal text-ink outline-none focus:border-brand"
                />
              </label>
              <label className="block text-sm font-semibold text-navy">
                Phone or email
                <input
                  required
                  name="contact"
                  className="mt-1.5 w-full rounded-xl border border-line bg-sand px-4 py-3 font-normal text-ink outline-none focus:border-brand"
                />
              </label>
              <label className="block text-sm font-semibold text-navy">
                What do you need cleaned?
                <textarea
                  required
                  name="body"
                  rows={4}
                  className="mt-1.5 w-full rounded-xl border border-line bg-sand px-4 py-3 font-normal text-ink outline-none focus:border-brand"
                />
              </label>
              <button
                className="w-full rounded-full bg-brand px-6 py-3 font-semibold text-white transition hover:bg-brand-dark"
                type="submit"
              >
                Send quote request
              </button>
            </form>
            <div className="mt-6 border-t border-line pt-6">
              <p className="eyebrow">Every job includes</p>
              <CheckList items={PROOF_POINTS} />
            </div>
            <p className="mt-6 text-xs leading-relaxed text-ink/55">
              By submitting you agree to our{" "}
              <Link className="underline" href="/privacy-policy/">
                Privacy Policy
              </Link>
              ,{" "}
              <Link className="underline" href="/terms/">
                Terms
              </Link>
              , and{" "}
              <Link className="underline" href="/sms-terms/">
                SMS terms
              </Link>
              .
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
