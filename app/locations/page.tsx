import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ImageHero } from "@/components/blocks";
import { Cta } from "@/components/cta";
import { JsonLd } from "@/components/json-ld";
import { MapEmbed } from "@/components/map-embed";
import { Section, SectionHead } from "@/components/ui";
import { cityEntries, serviceSlugs } from "@/lib/content";
import { cityLandmark, img } from "@/lib/images";
import { PhotoFrame } from "@/components/photo";
import { breadcrumbs } from "@/lib/schema";
import { SERVICE_GROUPS } from "@/lib/services";
import { site } from "@/lib/site";
import { titleCase } from "@/lib/utils";

export const metadata: Metadata = {
  title: { absolute: "Service Areas in Orange County, CA | Carpet & Duct" },
  description:
    "Carpet, rug, upholstery, and air duct cleaning across Irvine and Orange County, CA. Find your city and open the exact service page your home needs.",
  alternates: { canonical: "/locations/" },
};

export default function LocationsPage() {
  const all = cityEntries();
  // One tile per city. Every city in the map has a carpet page, so the
  // landmark grid links there; city pages for other services get chips below.
  const carpetCities = all.filter((c) => c.service === "carpet-cleaning");
  const otherCityPages = all.filter((c) => c.service !== "carpet-cleaning");

  return (
    <>
      <JsonLd
        data={breadcrumbs([
          { name: "Home", href: "/" },
          { name: "Service areas", href: "/locations/" },
        ])}
      />

      <ImageHero
        image={img("truck")}
        breadcrumb={[{ name: "Home", href: "/" }, { name: "Service areas" }]}
        eyebrow="Orange County, CA"
        title="Service areas across Orange County"
        body={`Based in ${site.city}, our crews cover ${site.area} daily. Every city page matches one service, so you always land on the page you searched for.`}
        bullets={["One city, one service, one URL", `Same-day openings`, `Since ${site.foundingYear}`]}
      />

      <Section tone="light">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <SectionHead
              eyebrow="Where we work"
              title="Our truck is in your neighborhood most days"
              body={`From the coast to the inland foothills, ${site.name} runs daily routes across ${site.area}. Find your city below — every page is written for that city, with real pricing and the next open slot.`}
            />
          </div>
          <MapEmbed query="Orange County, CA" title="Carpet & Duct Cleaning service area — Orange County, CA" height="h-72" />
        </div>
      </Section>

      <Section tone="sand">
        <SectionHead
          eyebrow="Find your city"
          title="Carpet cleaning in your city"
          body="Each tile is a carpet cleaning job in that city. Open it for pricing and the next open slot."
        />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {carpetCities.map((c) => {
            const image = cityLandmark(c.city);
            return (
              <Link
                key={c.route}
                href={`${c.route}/`}
                className="group relative overflow-hidden rounded-2xl shadow-card"
              >
                <PhotoFrame ratio="photo">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(min-width: 1024px) 18rem, (min-width: 640px) 45vw, 100vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <span className="absolute inset-0 bg-linear-to-t from-navy/90 via-navy/25 to-transparent" />
                </PhotoFrame>
                <span className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-2 p-4 text-white">
                  <span>
                    <span className="block text-[11px] font-semibold uppercase tracking-wider text-white/80">Carpet cleaning</span>
                    <span className="block font-semibold">{titleCase(c.city)}</span>
                  </span>
                  <ArrowRight className="mb-0.5 size-4 shrink-0 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </Section>

      {otherCityPages.length > 0 && (
        <Section tone="light">
          <SectionHead
            eyebrow="More by city"
            title="Air duct and hardwood pages by city"
            body="Dedicated city pages for services beyond carpet cleaning."
          />
          <ul className="mt-8 flex flex-wrap gap-2.5">
            {otherCityPages.map((c) => (
              <li key={c.route}>
                <Link
                  href={`${c.route}/`}
                  className="group inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 text-sm font-medium text-navy shadow-sm transition hover:-translate-y-0.5 hover:border-brand hover:text-brand hover:shadow-card"
                >
                  {titleCase(c.service)} in {titleCase(c.city)}
                  <ArrowRight className="size-3.5 text-brand transition group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section tone="light">
        <SectionHead
          eyebrow="Full service list"
          title="Every service we offer"
          body={`${serviceSlugs().length} service hubs, each with its own page and pricing conversation.`}
        />
        <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {SERVICE_GROUPS.map((group) => (
            <div key={group.title} className="rounded-2xl border border-line bg-sand p-6">
              <p className="eyebrow">{group.title}</p>
              <ul className="mt-3 space-y-2">
                {group.slugs.map((slug) => (
                  <li key={slug}>
                    <Link href={`/${slug}/`} className="font-medium text-navy hover:text-brand">
                      {titleCase(slug)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Cta title="Not sure your city is covered?" body={`Call ${site.phone} and we will tell you the next open slot in your area.`} />
    </>
  );
}
