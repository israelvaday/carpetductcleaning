import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CityCards, Gallery, Process, ServiceGrid, Stats, WhyUs } from "@/components/blocks";
import { Cta } from "@/components/cta";
import { FaqList } from "@/components/faq-list";
import { HomeHero } from "@/components/hero";
import { JsonLd } from "@/components/json-ld";
import { QuoteWizard } from "@/components/quote-wizard";
import { Reveal } from "@/components/fx";
import { Section, SectionHead } from "@/components/ui";
import { cityEntries, getUtility } from "@/lib/content";
import { asset, img } from "@/lib/images";
import { breadcrumbs, faqLd } from "@/lib/schema";
import { PROOF_POINTS } from "@/lib/services";
import { moneyServices, site } from "@/lib/site";
import { cleanParagraphs, extractFaqs } from "@/lib/text";
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
    a: "We use EPA Safer Choice certified, residue-free solutions. Products are safe for children, pets, and allergy sufferers once dry.",
  },
  {
    q: "Do you offer same-day carpet cleaning in Irvine?",
    a: "Yes. Same-day and next-day openings across Irvine and Orange County. Call (949) 992-3299.",
  },
];

export const metadata: Metadata = {
  title: { absolute: "Carpet Cleaning in Irvine, CA | Air Duct Cleaning" },
  description:
    "Google Guaranteed carpet cleaning and air duct cleaning in Irvine since 2013. IICRC-certified crews, same-day openings. Call (949) 992-3299.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  const home = getUtility("home");
  const paras = cleanParagraphs(home?.text || "", 4);
  const found = extractFaqs(home?.text || "");
  const faqs = found.length ? found : HOME_FAQS;
  const carpetCities = cityEntries().filter((c) => c.service === "carpet-cleaning");

  return (
    <>
      <JsonLd
        data={[
          breadcrumbs([{ name: "Home", href: "/" }]),
          faqLd(faqs) as Record<string, unknown>,
        ].filter(Boolean) as Record<string, unknown>[]}
      />

      <HomeHero image={img("hero-home")} />

      <Section tone="light" className="lg:pt-24">
        <Reveal>
          <SectionHead
            eyebrow="What we clean"
            title="Every service has its own page and its own crew"
            body="Carpet, ducts, rugs, upholstery, and hard floors. Pick the service you need and we will quote it on-site."
          />
        </Reveal>
        <ServiceGrid slugs={moneyServices.map((s) => s.href.replaceAll("/", ""))} priorityCount={4} />
        <Reveal className="mt-8">
          <Link href="/locations/" className="inline-flex items-center gap-2 font-semibold text-brand">
            See all services and service areas
            <ArrowRight className="size-4" />
          </Link>
        </Reveal>
      </Section>

      <WhyUs items={PROOF_POINTS} />

      <Process tone="light" />

      {/* Interactive quote wizard */}
      <Section tone="navy">
        <div className="grid items-start gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <SectionHead
              tone="navy"
              eyebrow="Get a price in minutes"
              title="Answer five quick questions"
              body="Tell us the service, the property, and the timing. We come back with an itemized price range and the next open slot — no obligation."
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
          <Reveal delay={0.15}>
            <QuoteWizard />
          </Reveal>
        </div>
      </Section>

      <Gallery />

      <Section tone="navy">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
          <Reveal>
            <SectionHead
              tone="navy"
              eyebrow="Carpet and air quality together"
              title="Clean floors and clean air in one visit"
              body="Most Orange County homes need both. Booking carpet and duct cleaning together means one crew, one trip, and one itemized quote."
            />
            <div className="mt-8 flex flex-wrap gap-3">
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
          <Reveal delay={0.15} className="grid gap-4 sm:grid-cols-2">
            <Link href="/carpet-cleaning/" className="group relative aspect-4/3 overflow-hidden rounded-2xl">
              <Image
                src={asset("/images/carpet-stains.webp")}
                alt="Carpet before and after professional stain removal"
                fill
                sizes="(min-width: 640px) 20rem, 100vw"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
              <span className="absolute inset-0 bg-linear-to-t from-navy/90 to-transparent" />
              <span className="absolute bottom-4 left-4 font-semibold text-white">Carpet Cleaning</span>
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
              <span className="absolute bottom-4 left-4 font-semibold text-white">Air Duct Cleaning</span>
            </Link>
          </Reveal>
        </div>
      </Section>

      <CityCards
        service="carpet-cleaning"
        cities={carpetCities}
        title="Carpet cleaning across Orange County"
        body="One city, one service, one URL. Every page below is written for that city."
      />

      {paras.length > 1 ? (
        <Section tone="light">
          <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
            <Reveal>
              <SectionHead eyebrow="About the company" title={`${site.name} in ${site.city}`} />
              <div className="prose-body mt-6 max-w-2xl">
                {paras.slice(1).map((p) => (
                  <p key={p.slice(0, 48)}>{p}</p>
                ))}
              </div>
              <Link
                href="/about/"
                className="mt-6 inline-flex items-center gap-2 font-semibold text-brand"
              >
                More about our crew
                <ArrowRight className="size-4" />
              </Link>
            </Reveal>
            <Reveal delay={0.1}>
              <Stats />
              <div className="relative mt-6 aspect-4/3 overflow-hidden rounded-2xl shadow-card">
                <Image
                  src={asset("/images/map.webp")}
                  alt="Orange County service area map"
                  fill
                  sizes="(min-width: 1024px) 24rem, 100vw"
                  className="object-cover"
                />
              </div>
              <p className="mt-3 text-sm text-ink/60">
                Based in {titleCase(site.city.toLowerCase())}. Crews cover {site.area} daily.
              </p>
            </Reveal>
          </div>
        </Section>
      ) : null}

      <FaqList items={faqs} />
      <Cta />
    </>
  );
}
