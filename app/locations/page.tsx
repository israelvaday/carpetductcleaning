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
import { cityCardImage, img } from "@/lib/images";
import { breadcrumbs } from "@/lib/schema";
import { SERVICE_GROUPS } from "@/lib/services";
import { site } from "@/lib/site";
import { titleCase } from "@/lib/utils";

export const metadata: Metadata = {
  title: { absolute: "Service Areas in Orange County, CA | Carpet & Duct" },
  description:
    "Carpet, rug, upholstery, and air duct cleaning across Irvine and Orange County, CA. Find your city and the exact service page you need.",
  alternates: { canonical: "/locations/" },
};

export default function LocationsPage() {
  const all = cityEntries();
  const groups = new Map<string, typeof all>();
  for (const c of all) {
    const list = groups.get(c.service) || [];
    list.push(c);
    groups.set(c.service, list);
  }

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

      {[...groups.entries()].map(([service, cities], index) => (
        <Section key={service} tone={index % 2 === 0 ? "sand" : "light"}>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHead eyebrow="Cities" title={`${titleCase(service)} by city`} />
            <Link href={`/${service}/`} className="inline-flex items-center gap-2 font-semibold text-brand">
              {titleCase(service)} hub
              <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {cities.map((c) => {
              const image = cityCardImage(service, c.city);
              return (
                <Link
                  key={c.route}
                  href={`${c.route}/`}
                  className="group relative overflow-hidden rounded-2xl shadow-card"
                >
                  <div className="relative aspect-4/3">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      sizes="(min-width: 1024px) 18rem, (min-width: 640px) 45vw, 100vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                    <span className="absolute inset-0 bg-linear-to-t from-navy/90 via-navy/25 to-transparent" />
                  </div>
                  <span className="absolute bottom-0 left-0 right-0 flex items-center justify-between p-4 text-white">
                    <span className="font-semibold">{titleCase(c.city)}</span>
                    <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        </Section>
      ))}

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
