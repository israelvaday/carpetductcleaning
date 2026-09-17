import type { Metadata } from "next";
import Image from "next/image";
import { Gallery, ImageHero, Process, Stats } from "@/components/blocks";
import { Cta } from "@/components/cta";
import { JsonLd } from "@/components/json-ld";
import { CheckList, Section, SectionHead, TrustRow } from "@/components/ui";
import { getUtility } from "@/lib/content";
import { img } from "@/lib/images";
import { breadcrumbs } from "@/lib/schema";
import { PROOF_POINTS } from "@/lib/services";
import { site, siteUrl } from "@/lib/site";
import { cleanParagraphs } from "@/lib/text";

export const metadata: Metadata = {
  title: { absolute: "About Carpet & Duct Cleaning | Irvine, CA Since 2013" },
  description: `Carpet & Duct Cleaning has served Irvine and Orange County since ${site.foundingYear}. IICRC-certified technicians, Google Guaranteed, BBB A+. Call ${site.phone}.`,
  alternates: { canonical: "/about/" },
};

export default function AboutPage() {
  const page = getUtility("about-us");
  const paras = cleanParagraphs(page?.text || "", 8);

  return (
    <>
      <JsonLd
        data={[
          {
            "@type": "AboutPage",
            "@id": `${siteUrl()}/about/#page`,
            name: `About ${site.name}`,
            url: `${siteUrl()}/about/`,
            about: { "@id": `${siteUrl()}/#business` },
          },
          breadcrumbs([
            { name: "Home", href: "/" },
            { name: "About", href: "/about/" },
          ]),
        ]}
      />

      <ImageHero
        image={img("van")}
        breadcrumb={[{ name: "Home", href: "/" }, { name: "About" }]}
        eyebrow={`${site.city}, ${site.region}`}
        title={`About ${site.name}`}
        body={`Founded in ${site.foundingYear}. A local crew cleaning carpets, rugs, upholstery, and air ducts across ${site.area}.`}
        bullets={[`${site.jobs} jobs completed`, `${site.rating} Google rating`, "IICRC certified"]}
      />

      <Section tone="light">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <SectionHead eyebrow="Our story" title="A local crew, not a franchise call center" />
            <div className="prose-body mt-6 max-w-2xl">
              {paras.length ? (
                paras.map((p) => <p key={p.slice(0, 40)}>{p.replace(/2021/g, String(site.foundingYear))}</p>)
              ) : (
                <p>
                  We started in {site.foundingYear} with one truck-mounted unit and a simple rule: quote the job
                  honestly, then do it properly. That has not changed.
                </p>
              )}
            </div>
            <div className="mt-8">
              <TrustRow />
            </div>
          </div>
          <div className="grid gap-6">
            <Stats />
            <div className="rounded-2xl border border-line bg-sand p-6 shadow-card">
              <p className="eyebrow">What that means on a job</p>
              <CheckList items={PROOF_POINTS} />
            </div>
          </div>
        </div>
      </Section>

      <Section tone="sand">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="relative aspect-3/4 overflow-hidden rounded-2xl shadow-card">
              <Image
                src="/images/tech.webp"
                alt="Technician treating a carpet stain with professional tools"
                fill
                sizes="(min-width: 1024px) 20rem, 45vw"
                className="object-cover"
              />
            </div>
            <div className="relative mt-8 aspect-3/4 overflow-hidden rounded-2xl shadow-card">
              <Image
                src="/images/truck-mount.webp"
                alt="Truck-mounted extraction hose running into an Orange County home"
                fill
                sizes="(min-width: 1024px) 20rem, 45vw"
                className="object-cover"
              />
            </div>
          </div>
          <div>
            <SectionHead
              eyebrow="Equipment"
              title="Truck-mounted power, low-moisture options when it fits"
              body="Hot-water extraction pulls soil out of the fiber instead of pushing it down. When a space has to be used the same day, we switch to low-moisture encapsulation instead of forcing one method onto every job."
            />
          </div>
        </div>
      </Section>

      <Process tone="light" />
      <Gallery limit={8} />
      <Cta title="Work with a local Irvine crew" />
    </>
  );
}
