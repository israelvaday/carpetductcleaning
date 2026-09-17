import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CityCards, Gallery, Process, ServiceGrid, Stats, WhyUs } from "@/components/blocks";
import { Cta } from "@/components/cta";
import { FaqList } from "@/components/faq-list";
import { JsonLd } from "@/components/json-ld";
import { CallButton, QuoteButton, RatingPill, Section, SectionHead, TrustRow } from "@/components/ui";
import { cityEntries, getUtility } from "@/lib/content";
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

      <section className="relative overflow-hidden bg-sand">
        <div className="container-page grid items-center gap-12 py-14 lg:grid-cols-2 lg:py-20">
          <div>
            <p className="eyebrow">
              {site.city} · {site.area} · Since {site.foundingYear}
            </p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight text-navy md:text-5xl lg:text-6xl">
              Carpet cleaning in Irvine, CA
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-ink/75">
              {paras[0] ||
                "Google Guaranteed carpet and air duct cleaning. Truck-mounted hot-water extraction, HEPA duct cleaning, and IICRC-certified technicians across Orange County."}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <CallButton />
              <QuoteButton />
            </div>
            <div className="mt-8 flex flex-col items-start gap-5">
              <RatingPill />
              <TrustRow />
            </div>
          </div>

          <div className="relative">
            <div className="relative aspect-4/3 overflow-hidden rounded-3xl shadow-lift">
              <Image
                src="/images/hero-home.webp"
                alt="Technician deep cleaning a carpet in an Orange County home"
                fill
                priority
                sizes="(min-width: 1024px) 40rem, 100vw"
                className="object-cover"
              />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4 lg:absolute lg:-bottom-8 lg:-left-10 lg:mt-0 lg:w-52 lg:grid-cols-1 lg:gap-0 lg:rounded-2xl lg:bg-white lg:p-5 lg:shadow-lift">
              <div className="rounded-xl bg-white p-3 text-center shadow-card lg:bg-transparent lg:p-0 lg:text-left lg:shadow-none">
                <p className="text-xl font-semibold text-navy lg:text-2xl">{site.jobs}</p>
                <p className="text-xs text-ink/60">jobs completed</p>
              </div>
              <div className="rounded-xl bg-white p-3 text-center shadow-card lg:mt-4 lg:border-t lg:border-line lg:bg-transparent lg:p-0 lg:pt-4 lg:text-left lg:shadow-none">
                <p className="text-xl font-semibold text-navy lg:text-2xl">{site.rating} ★</p>
                <p className="text-xs text-ink/60">Google rating</p>
              </div>
              <div className="rounded-xl bg-white p-3 text-center shadow-card lg:mt-4 lg:border-t lg:border-line lg:bg-transparent lg:p-0 lg:pt-4 lg:text-left lg:shadow-none">
                <p className="text-xl font-semibold text-navy lg:text-2xl">Same day</p>
                <p className="text-xs text-ink/60">openings available</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Section tone="light" className="lg:pt-24">
        <SectionHead
          eyebrow="What we clean"
          title="Every service has its own page and its own crew"
          body="Carpet, ducts, rugs, upholstery, and hard floors. Pick the service you need and we will quote it on-site."
        />
        <ServiceGrid slugs={moneyServices.map((s) => s.href.replaceAll("/", ""))} priorityCount={4} />
        <div className="mt-8">
          <Link href="/locations/" className="inline-flex items-center gap-2 font-semibold text-brand">
            See all services and service areas
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </Section>

      <WhyUs items={PROOF_POINTS} />

      <Process tone="light" />

      <Gallery />

      <Section tone="navy">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <SectionHead
              tone="navy"
              eyebrow="Carpet and air quality together"
              title="Clean floors and clean air in one visit"
              body="Most Orange County homes need both. Booking carpet and duct cleaning together means one crew, one trip, and one itemized quote."
            />
            <div className="mt-8 flex flex-wrap gap-3">
              <CallButton />
              <QuoteButton dark />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link href="/carpet-cleaning/" className="group relative aspect-4/3 overflow-hidden rounded-2xl">
              <Image
                src="/images/carpet-stains.webp"
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
                src="/images/duct-dirty-clean.webp"
                alt="Air duct before and after HEPA cleaning"
                fill
                sizes="(min-width: 640px) 20rem, 100vw"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
              <span className="absolute inset-0 bg-linear-to-t from-navy/90 to-transparent" />
              <span className="absolute bottom-4 left-4 font-semibold text-white">Air Duct Cleaning</span>
            </Link>
          </div>
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
            <div>
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
            </div>
            <div>
              <Stats />
              <div className="relative mt-6 aspect-4/3 overflow-hidden rounded-2xl shadow-card">
                <Image
                  src="/images/map.webp"
                  alt="Orange County service area map"
                  fill
                  sizes="(min-width: 1024px) 24rem, 100vw"
                  className="object-cover"
                />
              </div>
              <p className="mt-3 text-sm text-ink/60">
                Based in {titleCase(site.city.toLowerCase())}. Crews cover {site.area} daily.
              </p>
            </div>
          </div>
        </Section>
      ) : null}

      <FaqList items={faqs} />
      <Cta />
    </>
  );
}
