import type { Metadata } from "next";
import { Clock, MapPin, Phone } from "lucide-react";
import { ImageHero } from "@/components/blocks";
import { SocialLinks } from "@/components/social-links";
import { ContactQuote } from "@/components/contact-quote";
import { JsonLd } from "@/components/json-ld";
import { MapEmbed } from "@/components/map-embed";
import { CheckList, Section, SectionHead, TrustRow } from "@/components/ui";
import { getGoogleProfile, mapQuery } from "@/lib/google-profile";
import { img } from "@/lib/images";
import { breadcrumbs } from "@/lib/schema";
import { PROOF_POINTS } from "@/lib/services";
import { pageMeta } from "@/lib/seo";
import { site, siteUrl } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Contact Carpet & Duct Cleaning | Free Quotes in Irvine",
  description: `Call ${site.phone} or request a free, no-obligation quote for carpet, rug, upholstery, and air duct cleaning in Irvine and across Orange County, CA.`,
  path: "/contact/",
});

export default function ContactPage() {
  const profile = getGoogleProfile();
  const street = profile?.street || site.street;
  const city = profile?.city || site.city;
  const region = profile?.regionCode || site.region;
  const postalCode = profile?.postalCode || site.postalCode;
  const mapsHref = profile?.mapsUrl;

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
              <a
                href={
                  mapsHref ||
                  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery(profile))}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 rounded-2xl border border-line bg-sand p-5"
              >
                <MapPin className="mt-1 size-5 text-brand" />
                <span>
                  <span className="block text-sm font-semibold uppercase tracking-wide text-ink/55">Address</span>
                  <span className="block font-medium text-navy">
                    {street}
                    <br />
                    {city}, {region} {postalCode}
                  </span>
                  <span className="mt-1 block text-sm text-ink/65">
                    {profile?.neighborhood ? `${profile.neighborhood}, ${city}. ` : ""}
                    Serving {site.area}.
                  </span>
                </span>
              </a>
              <div className="flex items-start gap-4 rounded-2xl border border-line bg-sand p-5">
                <Clock className="mt-1 size-5 text-brand" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold uppercase tracking-wide text-ink/55">Hours</span>
                  {profile ? (
                    <ul className="mt-2 space-y-1 text-sm font-medium text-navy">
                      {profile.hours.map((row) => (
                        <li key={row.day} className="flex justify-between gap-4">
                          <span>{row.day}</span>
                          <span className={row.hours === "Closed" ? "text-ink/45" : undefined}>{row.hours}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="mt-1 block font-medium text-navy">Call for today’s hours</span>
                  )}
                  {profile?.wheelchairAccessibleParking ? (
                    <span className="mt-3 block text-sm text-ink/65">Wheelchair-accessible parking</span>
                  ) : null}
                </span>
              </div>
            </div>
            <div className="mt-8">
              <p className="text-sm font-semibold uppercase tracking-wide text-ink/55">Find us online</p>
              <div className="mt-3">
                <SocialLinks tone="light" />
              </div>
            </div>
            <div className="mt-8">
              <TrustRow />
            </div>
            <MapEmbed
              query={mapQuery(profile)}
              title={`${site.name} — ${street}, ${city}, ${region} ${postalCode}`}
              className="mt-8"
              height="h-64"
              zoom={15}
            />
          </div>

          <div className="rounded-3xl border border-line bg-white p-6 shadow-lift md:p-8">
            <h2 className="text-2xl font-semibold text-navy">Request a quote</h2>
            <p className="mt-2 text-ink/70">
              Walk through the service photos, or send a short note. Both reach the same inbox.
            </p>
            <div className="mt-6">
              <ContactQuote />
            </div>
            <div className="mt-6 border-t border-line pt-6">
              <p className="eyebrow">Every job includes</p>
              <CheckList items={PROOF_POINTS} />
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
