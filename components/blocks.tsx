import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BeforeAfterGallery, type BeforeAfterPair } from "@/components/before-after-slider";
import { JobGallery, type JobPhoto } from "@/components/job-gallery";
import { ProcessWizard, type ProcessStep } from "@/components/process-wizard";
import { Reveal } from "@/components/fx";
import { Breadcrumb, CallButton, CheckList, QuoteButton, RatingPill, Section, SectionHead, TrustBadges } from "@/components/ui";
import beforeAfterJson from "@/content/before-after.json";
import jobGalleryJson from "@/content/job-gallery.json";
import { asset, serviceImage, type Img } from "@/lib/images";
import { PhotoFrame } from "@/components/photo";
import { serviceBlurb, serviceName } from "@/lib/services";
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
        className="object-cover object-[center_40%]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-navy/75 via-navy/60 to-navy/80 lg:bg-[linear-gradient(90deg,#0b2237f2_0%,#0b2237c7_28%,#0b223780_46%,#0b223733_68%,#0b223714_100%)]"
      />
      <div className="container-page relative z-10 py-12 lg:py-16">
        <div className="mx-auto max-w-3xl text-center lg:mx-0 lg:text-left">
          {breadcrumb ? (
            <div className="mb-6 flex justify-center lg:justify-start">
              <Breadcrumb items={breadcrumb} tone="dark" />
            </div>
          ) : null}
          {eyebrow ? <p className="eyebrow text-brand-50">{eyebrow}</p> : null}
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-[1.08] md:text-5xl">{title}</h1>
          {body ? <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/80">{body}</p> : null}
          {bullets?.length ? (
            <ul className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium text-white/80 lg:justify-start">
              {bullets.map((b) => (
                <li key={b} className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-brand-50" aria-hidden />
                  {b}
                </li>
              ))}
            </ul>
          ) : null}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <CallButton />
            <QuoteButton dark />
            <RatingPill dark />
          </div>
          <TrustBadges className="mt-6 justify-center lg:justify-start" />
        </div>
      </div>
    </section>
  );
}

export function ServiceCard({ slug, priority = false }: { slug: string; priority?: boolean }) {
  const name = serviceName(slug);
  const image = serviceImage(slug, "card");
  return (
    <Link
      href={`/${slug}/`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-lift"
    >
      <PhotoFrame ratio="photo">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 24rem, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
      </PhotoFrame>
      <div className="flex flex-1 flex-col items-center p-5 text-center md:items-start md:text-left">
        <h3 className="text-lg font-semibold text-navy">{name}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-ink/70">{serviceBlurb(slug, name)}</p>
        <span className="mt-4 inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-brand">
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
        <Reveal key={slug} from={i % 2 === 0 ? "left" : "right"} delay={Math.min(i, 7) * 0.05}>
          <ServiceCard slug={slug} priority={i < priorityCount} />
        </Reveal>
      ))}
    </div>
  );
}

export function Stats({ tone = "navy" }: { tone?: "navy" | "sand" }) {
  const navy = tone === "navy";
  const stats = [
    { value: site.jobs, label: "Jobs completed" },
    { value: `${site.rating}★`, label: "Google rating" },
    { value: `${new Date().getFullYear() - site.foundingYear}+`, label: "Years in Orange County" },
    { value: "A+", label: "BBB rating" },
  ];
  return (
    <div
      className={cn(
        "grid h-fit grid-cols-2 content-start self-start overflow-hidden rounded-2xl border",
        navy ? "border-white/10 bg-navy" : "border-line bg-sand",
      )}
    >
      {stats.map((s, i) => (
        <div
          key={s.label}
          className={cn(
            "min-w-0 px-4 py-5 text-center sm:px-5",
            i % 2 === 0 && (navy ? "border-r border-white/10" : "border-r border-line"),
            i < 2 && (navy ? "border-b border-white/10" : "border-b border-line"),
          )}
        >
          <p
            className={cn(
              "font-display text-3xl font-semibold leading-none tracking-tight",
              navy ? "text-gold" : "text-navy",
            )}
          >
            {s.value}
          </p>
          <p className={cn("mt-2 text-sm leading-snug", navy ? "text-white/70" : "text-ink/65")}>{s.label}</p>
        </div>
      ))}
    </div>
  );
}

export function Process({ tone = "sand", steps }: { tone?: "light" | "sand"; steps?: ProcessStep[] }) {
  return (
    <Section tone={tone}>
      <Reveal from="down">
        <SectionHead
          eyebrow="How it works"
          title="From first call to final walkthrough"
          body="One room or a whole building, the job follows the same four steps."
        />
      </Reveal>
      <Reveal from="up" delay={0.1} className="mt-12">
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

const jobPhotos = jobGalleryJson as (JobPhoto & { place: "home" | "about" })[];

export function Gallery({
  compare = false,
  place = "home",
  showPhotos = true,
  showAll = false,
  compareTitle = "The soiled side and the cleaned pass",
  compareBody = "Dryer hoods, vent grilles, a couch, a rug, and carpet. Each slider is one real job. Drag the handle — or focus it and use the arrow keys — to compare the soiled side with the cleaned side.",
}: {
  compare?: boolean;
  place?: "home" | "about";
  showPhotos?: boolean;
  showAll?: boolean;
  compareTitle?: string;
  compareBody?: string;
}) {
  const photos = jobPhotos.filter((photo) => photo.place === place);

  return (
    <Section>
      {compare ? (
        <>
          <Reveal from="left">
            <SectionHead
              eyebrow="Before and after"
              title={compareTitle}
              body={compareBody}
            />
          </Reveal>
          <BeforeAfterGallery pairs={beforeAfter} showAll={showAll} />
        </>
      ) : null}
      {showPhotos ? (
      <div className={compare ? "mt-16" : undefined}>
        <Reveal from="right">
          <SectionHead
            eyebrow="Recent work"
            title="Real jobs from Orange County homes"
            body="Curtains, outdoor cushions, rugs, floors, upholstery, and the truck. These are photos from jobs we finished."
          />
        </Reveal>
        <JobGallery photos={photos} />
      </div>
      ) : null}
    </Section>
  );
}

export function WhyUs({ items }: { items: string[] }) {
  return (
    <Section tone="sand">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <Reveal from="left">
          <SectionHead
            eyebrow="Why homeowners call us"
            title="Google Guaranteed crews, upfront prices, no upsell games"
            body="You get a price before we start, a Google Guaranteed crew, and the finished work to judge for yourself."
          />
          <CheckList items={items} />
          <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
            <CallButton />
            <QuoteButton />
          </div>
        </Reveal>
        <Reveal from="right" delay={0.1} className="grid gap-4 sm:grid-cols-2">
          <PhotoFrame ratio="photo" rounded="card" className="shadow-card sm:col-span-2">
            <Image
              src={asset("/images/tech.webp")}
              alt="Technician treating a carpet stain with professional tools"
              fill
              sizes="(min-width: 1024px) 24rem, 45vw"
              className="object-cover"
            />
          </PhotoFrame>
          <PhotoFrame ratio="photo" rounded="card" className="shadow-card">
              <Image
                src={asset("/images/van.webp")}
                alt="Carpet And Duct Cleaning service van in Irvine, CA"
                fill
                sizes="(min-width: 1024px) 24rem, 45vw"
                className="object-cover"
              />
          </PhotoFrame>
          <PhotoFrame ratio="photo" rounded="card" className="shadow-card">
              <Image
                src={asset("/images/carpet-family.webp")}
                alt="Family relaxing on a freshly cleaned carpet"
                fill
                sizes="(min-width: 1024px) 24rem, 45vw"
                className="object-cover"
              />
          </PhotoFrame>
        </Reveal>
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
      <Reveal from="left">
        <SectionHead eyebrow="Service areas" title={title} body={body} />
      </Reveal>
      {/* Text chips, not photo cards: every city photo is reserved for its own
          city page and its /locations tile, so nothing ever repeats. */}
      <Reveal from="up" delay={0.08} className="mt-10">
      <ul className="flex flex-wrap gap-2.5">
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
      </Reveal>
    </Section>
  );
}
