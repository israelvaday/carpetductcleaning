import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CityCards, Gallery, Process, ServiceGrid, Stats, WhyUs } from "@/components/blocks";
import { Cta } from "@/components/cta";
import { FaqList } from "@/components/faq-list";
import { HomeHero } from "@/components/hero";
import { JsonLd } from "@/components/json-ld";
import { MapEmbed } from "@/components/map-embed";
import { QuoteWizard } from "@/components/quote-wizard";
import { Reveal } from "@/components/fx";
import { Reviews } from "@/components/reviews";
import { QuoteButton } from "@/components/quote-button";
import { Section, SectionHead } from "@/components/ui";
import { cityEntries } from "@/lib/content";
import { getGoogleProfile, mapCid, mapQuery } from "@/lib/google-profile";
import { asset, img } from "@/lib/images";
import { breadcrumbs, faqLd } from "@/lib/schema";
import { PROOF_POINTS } from "@/lib/services";
import { pageMeta } from "@/lib/seo";
import { moneyServices, site } from "@/lib/site";
import { titleCase } from "@/lib/utils";

const HOME_FAQS = [
  {
    q: "How much does carpet cleaning cost in Irvine, CA?",
    a: "Carpet cleaning in Irvine typically costs $35 to $65 per room or $150 to $300 for a whole home depending on size and condition. We quote on-site before work begins.",
  },
  {
    q: "How long does carpet cleaning take to dry in Irvine?",
    a: "Most carpets dry within 4 to 8 hours after hot-water extraction. Keep HVAC on Auto and open windows to speed drying.",
  },
  {
    q: "Is professional carpet cleaning safe for kids and pets?",
    a: "We use EPA Safer Choice certified solutions and rinse thoroughly so little residue is left behind. Products are safe for children, pets, and allergy sufferers once dry.",
  },
  {
    q: "Do you offer same-day carpet cleaning in Irvine?",
    a: "Yes. Same-day and next-day openings across Irvine and Orange County. Call (949) 992-3299.",
  },
];

export const metadata: Metadata = pageMeta({
  title: "Carpet Cleaning in Irvine, CA | Air Duct & Rug Cleaning",
  description:
    "Google Guaranteed carpet and air duct cleaning in Irvine, CA since 2013. BBB A+, same-day openings across Orange County. Call (949) 992-3299.",
  path: "/",
});

export default function HomePage() {
  const faqs = HOME_FAQS;
  const carpetCities = cityEntries().filter((c) => c.service === "carpet-cleaning");
  const profile = getGoogleProfile();

  return (
    <>
      <JsonLd
        data={[
          breadcrumbs([{ name: "Home", href: "/" }]),
          faqLd(faqs) as Record<string, unknown>,
        ].filter(Boolean) as Record<string, unknown>[]}
      />

      <HomeHero image={img("hero-home")} />

      <Gallery
        compare
        showPhotos={false}
        showAll
        compareTitle="Real Photos from Our Actual Jobs."
        compareBody="Dryer vents, air ducts, carpet, a sofa, and a rug. Each photo is the same spot before we started and after we finished."
      />

      <Section tone="sand" className="py-10 md:py-14">
        <Reveal from="down">
          <SectionHead
            eyebrow="More than carpet"
            title="Curtains, outdoor cushions, and the rest of the house"
            body="A full set of curtains or a patio of cushions gets the same care as a whole house. Call and we will hold the next opening for you."
          />
        </Reveal>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {[
            { href: "/drape-cleaning/", title: "Curtain Cleaning", detail: "Drapes and curtains cleaned in place, including full-length sets." },
            { href: "/outdoor-furniture-cleaning/", title: "Outdoor Cushion Cleaning", detail: "Patio cushions and the frames they sit on." },
            { href: "/carpet-cleaning/", title: "Whole-home carpet", detail: "Rooms, halls, and stairs in one visit." },
            { href: "/air-duct-cleaning/", title: "Whole-house air ducts", detail: "Supply lines, returns, and the registers." },
            { href: "/water-damage-restoration/", title: "Water damage", detail: "Extraction and drying when a room is soaked." },
            { href: "/dryer-vent-cleaning/", title: "Dryer vent systems", detail: "The full duct run and the outside hood." },
          ].map((job) => (
            <Link
              key={job.href}
              href={job.href}
              className="flex min-h-16 items-center justify-between gap-4 rounded-2xl bg-white px-5 py-4 shadow-card ring-1 ring-navy/5 transition hover:ring-brand"
            >
              <span>
                <span className="block text-base font-semibold text-navy">{job.title}</span>
                <span className="mt-1 block text-sm text-ink/65">{job.detail}</span>
              </span>
              <ArrowRight className="size-5 shrink-0 text-brand" />
            </Link>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3 lg:justify-start">
          <QuoteButton className="h-12 px-8" />
        </div>
      </Section>

      <Section tone="light">
        <Reveal from="down">
          <SectionHead
            eyebrow="What we clean"
            title="Carpet, ducts, curtains, cushions, and floors"
            body="Carpet, ducts, curtains, outdoor cushions, rugs, and hard floors. Pick the service you need and we will quote it on-site."
          />
        </Reveal>
        <ServiceGrid slugs={moneyServices.map((s) => s.href.replaceAll("/", ""))} priorityCount={4} />
        <Reveal className="mt-8 text-center md:text-left">
          <Link href="/locations/" className="inline-flex items-center justify-center gap-2 font-semibold text-brand">
            See every city we cover
            <ArrowRight className="size-4" />
          </Link>
        </Reveal>
      </Section>

      <WhyUs items={PROOF_POINTS} />

      <Reviews />

      <Process tone="light" />

      {/* Interactive quote wizard */}
      <Section tone="navy">
        <div className="grid items-start gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal from="left">
            <SectionHead
              tone="navy"
              eyebrow="Book the next opening"
              title="Call, or send the job in one step"
              body="The fastest booking is a phone call. If you would rather type it, pick the service and your city and we reply with a price range and the next slot."
            />
            <ul className="mt-8 space-y-3 text-white/85">
              {["Itemized quote before any work starts", "Same-day and next-day openings", "Safe for kids, pets, and allergies"].map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-gold text-xs font-bold text-navy">✓</span>
                  {b}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal from="right" delay={0.12}>
            <QuoteWizard />
          </Reveal>
        </div>
      </Section>

      <Gallery />

      <Section tone="navy">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
          <Reveal from="left">
            <SectionHead
              tone="navy"
              eyebrow="Carpet and air quality together"
              title="Clean floors and clean air in one visit"
              body="Most Orange County homes need both. Booking carpet and duct cleaning together means one crew, one trip, and one itemized quote."
            />
            <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
              <Link
                href="/carpet-cleaning/"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-gold px-6 text-sm font-bold uppercase tracking-wide text-navy transition hover:bg-gold-dark"
              >
                Carpet cleaning
              </Link>
              <Link
                href="/air-duct-cleaning/"
                className="inline-flex h-12 items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 text-sm font-bold uppercase tracking-wide text-white transition hover:border-gold/60 hover:text-gold"
              >
                Air duct cleaning
              </Link>
            </div>
          </Reveal>
          <Reveal from="right" delay={0.12} className="grid gap-4 sm:grid-cols-2">
            <Link href="/carpet-cleaning/" className="group relative aspect-4/3 overflow-hidden rounded-2xl">
              <Image
                src={asset("/images/carpet-stains.webp")}
                alt="Carpet before and after professional stain removal"
                fill
                sizes="(min-width: 640px) 20rem, 100vw"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
              <span className="absolute inset-0 bg-linear-to-t from-navy/90 to-transparent" />
              <span className="absolute inset-x-0 bottom-4 text-center font-semibold text-white sm:inset-x-auto sm:left-4 sm:text-left">Carpet Cleaning</span>
            </Link>
            <Link href="/air-duct-cleaning/" className="group relative aspect-4/3 overflow-hidden rounded-2xl">
              <Image
                src={asset("/images/duct-work.webp")}
                alt="Air duct before and after HEPA cleaning"
                fill
                sizes="(min-width: 640px) 20rem, 100vw"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
              <span className="absolute inset-0 bg-linear-to-t from-navy/90 to-transparent" />
              <span className="absolute inset-x-0 bottom-4 text-center font-semibold text-white sm:inset-x-auto sm:left-4 sm:text-left">Air Duct Cleaning</span>
            </Link>
          </Reveal>
        </div>
      </Section>

      <CityCards
        service="carpet-cleaning"
        cities={carpetCities}
        title="Carpet cleaning across Orange County"
        body="Choose your city. We quote the carpet before we start and tell you the next opening."
      />

      <Section tone="light">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <Reveal from="left">
            <SectionHead eyebrow="About the company" title={`${site.name} in ${site.city}`} />
            <div className="prose-body mt-6 max-w-2xl">
              <p>
                Carpet and duct cleaning in Irvine has been our work since 2013. Truck-mounted hot-water extraction
                lifts soil out of the carpet. A HEPA negative-air machine pulls dust out of the ductwork. The same
                crew can do both on one visit, and the price is itemized before anything starts.
              </p>
              <p>
                The company is Google Guaranteed. The products are EPA Safer Choice, so kids and pets can be back in the room
                once it is dry. You get the price on site, before any work starts. Call (949) 992-3299 for a same-day or next-day opening.
              </p>
            </div>
              <Link
                href="/about/"
                className="mt-6 inline-flex items-center gap-2 font-semibold text-brand"
              >
                More about our crew
                <ArrowRight className="size-4" />
              </Link>
            </Reveal>
            <div className="self-start">
              <Reveal from="right" delay={0.12}>
                <Stats />
              </Reveal>
              <MapEmbed
                query={mapQuery(profile)}
                cid={mapCid(profile)}
                title={`${site.name} — ${profile?.formattedAddress || `${site.street}, ${site.city}, ${site.region} ${site.postalCode}`}`}
                className="mt-6"
                height="h-80"
                zoom={15}
                loading="eager"
              />
              <p className="mt-3 text-sm text-ink/60">
                Based in {profile?.neighborhood ? `${profile.neighborhood}, ` : ""}
                {titleCase(site.city.toLowerCase())}. Crews cover {site.area} daily.
              </p>
              {profile?.hoursSummary ? (
                <p className="mt-1 text-sm text-ink/60">{profile.hoursSummary}</p>
              ) : null}
            </div>
          </div>
        </Section>

      <FaqList items={faqs} />
      <Cta showTrust={false} />
    </>
  );
}
