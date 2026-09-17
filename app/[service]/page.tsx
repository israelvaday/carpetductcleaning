import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { CityCards, ImageHero, Process } from "@/components/blocks";
import { Cta } from "@/components/cta";
import { FaqList } from "@/components/faq-list";
import { JsonLd } from "@/components/json-ld";
import { CallButton, CheckList, QuoteButton, Section, SectionHead } from "@/components/ui";
import { getServiceDoc, serviceSlugs } from "@/lib/content";
import { serviceImage, serviceSteps } from "@/lib/images";
import { breadcrumbs, faqLd } from "@/lib/schema";
import { PROOF_POINTS, serviceBlurb } from "@/lib/services";
import { site } from "@/lib/site";
import { buildServiceSteps } from "@/lib/process-steps";
import { titleCase } from "@/lib/utils";

export function generateStaticParams() {
  return serviceSlugs().map((service) => ({ service }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ service: string }>;
}): Promise<Metadata> {
  const { service } = await params;
  const doc = getServiceDoc(service);
  if (!doc) return {};
  return {
    title: { absolute: doc.title },
    description: doc.description,
    alternates: { canonical: `/${doc.slug}/` },
  };
}

export default async function ServicePage({ params }: { params: Promise<{ service: string }> }) {
  const { service } = await params;
  const doc = getServiceDoc(service);
  if (!doc) notFound();

  const related = serviceSlugs()
    .filter((s) => s !== service)
    .slice(0, 4);

  return (
    <>
      <JsonLd
        data={[
          breadcrumbs([
            { name: "Home", href: "/" },
            { name: doc.name, href: `/${doc.slug}/` },
          ]),
          faqLd(doc.faqs) as Record<string, unknown>,
        ].filter(Boolean) as Record<string, unknown>[]}
      />

      <ImageHero
        image={serviceImage(doc.slug)}
        breadcrumb={[{ name: "Home", href: "/" }, { name: doc.name }]}
        eyebrow={`${site.area} · Since ${site.foundingYear}`}
        title={doc.h1}
        body={serviceBlurb(doc.slug, doc.name)}
        bullets={["IICRC certified", "Google Guaranteed", "Upfront on-site quote", "Same-day openings"]}
      />

      <Section tone="light">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <SectionHead eyebrow="What to expect" title={`${doc.name} done right`} />
            <div className="prose-body mt-6 max-w-2xl">
              {doc.paragraphs.length ? (
                doc.paragraphs.map((p) => <p key={p.slice(0, 48)}>{p}</p>)
              ) : (
                <p>
                  {doc.name} for homes and businesses across {site.area}. Call {site.phone} for an itemized quote
                  before any work starts.
                </p>
              )}
            </div>
          </div>

          <aside className="lg:sticky lg:top-32 lg:self-start">
            <div className="rounded-2xl border border-line bg-sand p-6 shadow-card">
              <p className="eyebrow">Included on every job</p>
              <CheckList items={PROOF_POINTS} />
              <div className="mt-6 flex flex-col gap-3">
                <CallButton className="w-full" />
                <QuoteButton className="w-full" />
              </div>
              <p className="mt-4 text-sm text-ink/60">
                {site.city} and {site.area}.{" "}
                {doc.slug === "air-duct-cleaning"
                  ? "Ask about pairing duct work with carpet cleaning in the same visit."
                  : doc.slug === "carpet-cleaning"
                    ? "Ask about pairing carpet cleaning with air duct cleaning in the same visit."
                    : `Ask about pairing ${doc.name.toLowerCase()} with carpet or duct cleaning in the same visit.`}
              </p>
            </div>
          </aside>
        </div>
      </Section>

      <Process steps={buildServiceSteps(doc.slug, serviceSteps(doc.slug))} />

      <CityCards
        service={doc.slug}
        cities={doc.cities}
        title={`${doc.name} by city`}
        body={`Pages below are written for that city. Anything not listed is still covered — call ${site.phone}.`}
      />

      <FaqList items={doc.faqs} title={`${doc.name} questions`} />

      <Section tone="light">
        <SectionHead eyebrow="Other services" title="Often booked together" />
        {/* Text cards: a service's photos live on its own hub and the homepage
            grid only — never repeated on every other service page. */}
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((s) => (
            <li key={s}>
              <Link
                href={`/${s}/`}
                className="group flex h-full flex-col rounded-2xl border border-line bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-lift"
              >
                <span className="font-semibold text-navy group-hover:text-brand">{titleCase(s)}</span>
                <span className="mt-2 flex-1 text-sm leading-relaxed text-ink/65">{serviceBlurb(s, titleCase(s))}</span>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
                  View service
                  <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <Link href="/locations/" className="inline-flex items-center gap-2 font-semibold text-brand">
            Browse every service
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </Section>

      <Cta title={`Book ${doc.name.toLowerCase()} in ${site.area}`} />
    </>
  );
}
