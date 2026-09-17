import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { ImageHero, Stats } from "@/components/blocks";
import { Cta } from "@/components/cta";
import { FaqList } from "@/components/faq-list";
import { JsonLd } from "@/components/json-ld";
import { QuoteWizard } from "@/components/quote-wizard";
import { CallButton, CheckList, QuoteButton, Section, SectionHead } from "@/components/ui";
import { cityEntries, getCityDoc } from "@/lib/content";
import { cityImage, cityJobs } from "@/lib/images";
import { breadcrumbs, faqLd } from "@/lib/schema";
import { PROOF_POINTS } from "@/lib/services";
import { moneyServices, site } from "@/lib/site";
import { titleCase } from "@/lib/utils";

export function generateStaticParams() {
  return cityEntries().map((c) => ({ service: c.service, city: c.city }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ service: string; city: string }>;
}): Promise<Metadata> {
  const { service, city } = await params;
  const doc = getCityDoc(service, city);
  if (!doc) return {};
  return {
    title: { absolute: doc.title },
    description: doc.description,
    alternates: { canonical: `/${doc.service}/${doc.city}/` },
  };
}

export default async function CityPage({
  params,
}: {
  params: Promise<{ service: string; city: string }>;
}) {
  const { service, city } = await params;
  const doc = getCityDoc(service, city);
  if (!doc) notFound();

  const nearby = cityEntries()
    .filter((c) => c.service === doc.service && c.city !== doc.city)
    .slice(0, 8);
  const otherServices = moneyServices
    .map((s) => s.href.replaceAll("/", ""))
    .filter((s) => s !== doc.service)
    .slice(0, 6);

  return (
    <>
      <JsonLd
        data={[
          breadcrumbs([
            { name: "Home", href: "/" },
            { name: doc.serviceName, href: `/${doc.service}/` },
            { name: doc.cityName, href: `/${doc.service}/${doc.city}/` },
          ]),
          faqLd(doc.faqs) as Record<string, unknown>,
        ].filter(Boolean) as Record<string, unknown>[]}
      />

      <ImageHero
        image={cityImage(doc.service, doc.city)}
        breadcrumb={[
          { name: "Home", href: "/" },
          { name: doc.serviceName, href: `/${doc.service}/` },
          { name: doc.cityName },
        ]}
        eyebrow={`${doc.cityName}, CA`}
        title={doc.h1}
        body={`${doc.serviceName} for ${doc.cityName} homes and businesses. IICRC-certified technicians, itemized quotes, same-day openings.`}
        bullets={["Local crews", "Google Guaranteed", "Safe for kids and pets"]}
      />

      <Section tone="light">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <SectionHead eyebrow={`Serving ${doc.cityName}`} title={`${doc.serviceName} in ${doc.cityName}`} />
            <div className="prose-body mt-6 max-w-2xl">
              {doc.paragraphs.map((p) => (
                <p key={p.slice(0, 48)}>{p}</p>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <CallButton />
              <QuoteButton />
            </div>
          </div>

          <aside className="grid gap-6 lg:sticky lg:top-32 lg:self-start">
            <div className="rounded-2xl border border-line bg-sand p-6 shadow-card">
              <p className="eyebrow">Why {doc.cityName} calls us</p>
              <CheckList items={PROOF_POINTS} />
            </div>
            <Stats tone="navy" />
          </aside>
        </div>
      </Section>

      <Section tone="sand">
        <SectionHead
          eyebrow="Recent work"
          title={`${doc.serviceName} jobs near ${doc.cityName}`}
          body="Photos from our own crews working in this part of Orange County."
        />
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {cityJobs(doc.service, doc.city).map((photo) => (
            <div key={photo.src} className="relative aspect-4/3 overflow-hidden rounded-xl shadow-card">
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(min-width: 640px) 45vw, 90vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </Section>

      <Section tone="light" id="quote">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <SectionHead
              eyebrow={`Serving ${doc.cityName}`}
              title={`Your local ${doc.serviceName.toLowerCase()} crew in ${doc.cityName}`}
              body={`Our van is in ${doc.cityName} and the surrounding neighborhoods most days. Answer a few quick questions and we come back with an itemized price range and the next open slot.`}
            />
            <div className="mt-8 overflow-hidden rounded-2xl border border-line shadow-card">
              <iframe
                title={`Map of ${doc.cityName}, CA service area`}
                src={`https://www.google.com/maps?q=${encodeURIComponent(`${doc.cityName}, CA`)}&z=12&output=embed`}
                className="h-64 w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
          <QuoteWizard defaultService={doc.service} />
        </div>
      </Section>

      <FaqList items={doc.faqs} title={`${doc.cityName} questions`} />

      <Section tone="sand">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHead eyebrow="Nearby" title={`${doc.serviceName} in nearby cities`} />
            <ul className="mt-6 flex flex-wrap gap-2">
              {nearby.map((c) => (
                <li key={c.route}>
                  <Link
                    href={`${c.route}/`}
                    className="inline-block rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-navy transition hover:border-brand hover:text-brand"
                  >
                    {titleCase(c.city)}
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/locations/" className="mt-6 inline-flex items-center gap-2 font-semibold text-brand">
              All service areas
              <ArrowRight className="size-4" />
            </Link>
          </div>
          <div>
            <SectionHead eyebrow="Other services" title={`Also available in ${doc.cityName}`} />
            <ul className="mt-6 grid gap-2 sm:grid-cols-2">
              {otherServices.map((s) => (
                <li key={s}>
                  <Link
                    href={`/${s}/`}
                    className="flex items-center justify-between gap-2 rounded-xl border border-line bg-white px-4 py-3 text-sm font-medium text-navy transition hover:border-brand"
                  >
                    {titleCase(s)}
                    <ArrowRight className="size-4 text-brand" />
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-ink/60">
              Need something else in {doc.cityName}? Call {site.phone}.
            </p>
          </div>
        </div>
      </Section>

      <Cta title={`${doc.serviceName} in ${doc.cityName}, CA`} />
    </>
  );
}
