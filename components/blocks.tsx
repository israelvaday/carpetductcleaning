import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BeforeAfterSlider, type BeforeAfterPair } from "@/components/before-after-slider";
import { ProcessWizard, type ProcessStep } from "@/components/process-wizard";
import { Reveal } from "@/components/fx";
import { Breadcrumb, CallButton, CheckList, QuoteButton, RatingPill, Section, SectionHead } from "@/components/ui";
import beforeAfterJson from "@/content/before-after.json";
import { asset, gallery, serviceImage, type Img } from "@/lib/images";
import { serviceBlurb } from "@/lib/services";
import { site } from "@/lib/site";
import { cn, titleCase } from "@/lib/utils";

export function ImageHero({
  image,
  breadcrumb,
  eyebrow,
  title,
  body,
  bullets,
}: {
  image: Img;
  breadcrumb?: { name: string; href?: string }[];
  eyebrow?: string;
  title: string;
  body?: string;
  bullets?: string[];
}) {
  return (
    <section className="relative isolate overflow-hidden bg-navy text-white">
      <Image
        src={image.src}
        alt={image.alt}
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-linear-to-r from-navy via-navy/90 to-navy/50" />
      <div className="container-page py-14 md:py-20">
        {breadcrumb ? (
          <div className="mb-6">
            <Breadcrumb items={breadcrumb} tone="dark" />
          </div>
        ) : null}
        {eyebrow ? <p className="eyebrow text-brand-50">{eyebrow}</p> : null}
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight md:text-5xl">{title}</h1>
        {body ? <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/80">{body}</p> : null}
        {bullets?.length ? (
          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-white/80">
            {bullets.map((b) => (
              <li key={b} className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-brand-50" aria-hidden />
                {b}
              </li>
            ))}
          </ul>
        ) : null}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <CallButton />
          <QuoteButton dark />
          <RatingPill dark />
        </div>
      </div>
    </section>
  );
}

export function ServiceCard({ slug, priority = false }: { slug: string; priority?: boolean }) {
  const name = titleCase(slug);
  const image = serviceImage(slug, "card");
  return (
    <Link
      href={`/${slug}/`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-lift"
    >
      <div className="relative aspect-16/10 overflow-hidden">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 24rem, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold text-navy">{name}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-ink/70">{serviceBlurb(slug, name)}</p>
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
          View service
          <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

export function ServiceGrid({ slugs, priorityCount = 0 }: { slugs: string[]; priorityCount?: number }) {
  return (
    <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {slugs.map((slug, i) => (
        <Reveal key={slug} delay={Math.min(i, 7) * 0.06}>
          <ServiceCard slug={slug} priority={i < priorityCount} />
        </Reveal>
      ))}
    </div>
  );
}

export function Stats({ tone = "navy" }: { tone?: "navy" | "sand" }) {
  const stats = [
    { value: site.jobs, label: "Jobs completed" },
    { value: `${site.rating}★`, label: "Google rating" },
    { value: `${new Date().getFullYear() - site.foundingYear}+`, label: "Years in Orange County" },
    { value: "A+", label: "BBB rating" },
  ];
  return (
    <div
      className={cn(
        "grid gap-6 rounded-2xl px-6 py-8 sm:grid-cols-4",
        tone === "navy" ? "bg-navy text-white" : "bg-sand",
      )}
    >
      {stats.map((s) => (
        <div key={s.label}>
          <p className={cn("text-3xl font-semibold", tone === "navy" ? "text-white" : "text-navy")}>{s.value}</p>
          <p className={cn("mt-1 text-sm", tone === "navy" ? "text-white/65" : "text-ink/60")}>{s.label}</p>
        </div>
      ))}
    </div>
  );
}

export function Process({ tone = "sand", steps }: { tone?: "light" | "sand"; steps?: ProcessStep[] }) {
  return (
    <Section tone={tone}>
      <Reveal>
        <SectionHead
          eyebrow="How it works"
          title="From first call to final walkthrough"
          body="Every job runs the same four steps whether it is one room or a whole building. Tap a step to see it."
        />
      </Reveal>
      <Reveal delay={0.1} className="mt-12">
        <ProcessWizard steps={steps} />
      </Reveal>
    </Section>
  );
}

const beforeAfter: BeforeAfterPair[] = (beforeAfterJson as BeforeAfterPair[]).map((pair) => ({
  ...pair,
  before: asset(pair.before),
  after: asset(pair.after),
}));

export function Gallery({
  limit = 8,
  offset = 0,
  compare = false,
}: {
  limit?: number;
  offset?: number;
  compare?: boolean;
}) {
  return (
    <Section>
      {compare ? (
        <>
          <SectionHead
            eyebrow="Before and after"
            title="Vents and ducts, before and after cleaning"
            body="Drag the handle on each photo — or focus it and use the arrow keys — to compare the vent before cleaning and after."
          />
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {beforeAfter.map((pair, i) => (
              <Reveal key={pair.after} delay={Math.min(i, 7) * 0.05}>
                <BeforeAfterSlider pair={pair} priority={i < 3} />
              </Reveal>
            ))}
          </div>
        </>
      ) : null}
      <div className={compare ? "mt-16" : undefined}>
        <SectionHead
          eyebrow="Recent work"
          title="Real jobs from Orange County homes"
          body="Photos from our own crews — carpet, rugs, upholstery, tile, and duct work."
        />
        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
          {gallery.slice(offset, offset + limit).map((photo, i) => (
            <Reveal key={photo.src} delay={Math.min(i, 7) * 0.05}>
              <div className="relative aspect-square overflow-hidden rounded-xl shadow-card">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(min-width: 768px) 22vw, 45vw"
                  className="object-cover transition duration-500 hover:scale-105"
                />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}

export function WhyUs({ items }: { items: string[] }) {
  return (
    <Section tone="sand">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <SectionHead
            eyebrow="Why homeowners call us"
            title="Certified crews, upfront prices, no upsell games"
            body="The old site leaned on superlatives. We would rather show the credentials and let the work stand."
          />
          <CheckList items={items} />
          <div className="mt-8 flex flex-wrap gap-3">
            <CallButton />
            <QuoteButton />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="relative aspect-4/5 overflow-hidden rounded-2xl shadow-card">
            <Image
              src={asset("/images/tech.webp")}
              alt="Technician treating a carpet stain with professional tools"
              fill
              sizes="(min-width: 1024px) 24rem, 45vw"
              className="object-cover"
            />
          </div>
          <div className="grid gap-4">
            <div className="relative aspect-4/3 overflow-hidden rounded-2xl shadow-card">
              <Image
                src={asset("/images/van.webp")}
                alt="Carpet And Duct Cleaning service van in Irvine, CA"
                fill
                sizes="(min-width: 1024px) 24rem, 45vw"
                className="object-cover"
              />
            </div>
            <div className="relative aspect-4/3 overflow-hidden rounded-2xl shadow-card">
              <Image
                src={asset("/images/carpet-family.webp")}
                alt="Family relaxing on a freshly cleaned carpet"
                fill
                sizes="(min-width: 1024px) 24rem, 45vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

export function CityCards({
  service,
  cities,
  title,
  body,
}: {
  service: string;
  cities: { route: string; city: string }[];
  title: string;
  body?: string;
}) {
  if (!cities.length) return null;
  return (
    <Section tone="sand">
      <SectionHead eyebrow="Service areas" title={title} body={body} />
      {/* Text chips, not photo cards: every city photo is reserved for its own
          city page and its /locations tile, so nothing ever repeats. */}
      <ul className="mt-10 flex flex-wrap gap-2.5">
        {cities.map((c) => (
          <li key={c.route}>
            <Link
              href={`${c.route}/`}
              className="group inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 text-sm font-medium text-navy shadow-sm transition hover:-translate-y-0.5 hover:border-brand hover:text-brand hover:shadow-card"
            >
              {titleCase(c.city)}
              <ArrowRight className="size-3.5 text-brand transition group-hover:translate-x-0.5" />
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}
