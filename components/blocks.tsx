import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Breadcrumb, CallButton, CheckList, QuoteButton, RatingPill, Section, SectionHead } from "@/components/ui";
import { asset, cityImage, gallery, serviceImage, type Img } from "@/lib/images";
import { PROCESS_STEPS, serviceBlurb } from "@/lib/services";
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
        <ServiceCard key={slug} slug={slug} priority={i < priorityCount} />
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

export function Process({ tone = "sand" }: { tone?: "light" | "sand" }) {
  return (
    <Section tone={tone}>
      <SectionHead
        eyebrow="How it works"
        title="Three steps, no surprises"
        body="Every job runs the same way whether it is one room or a whole building."
      />
      <ol className="mt-10 grid gap-6 md:grid-cols-3">
        {PROCESS_STEPS.map((step, i) => (
          <li key={step.title} className="rounded-2xl border border-line bg-white p-6 shadow-card">
            <span className="flex size-10 items-center justify-center rounded-full bg-brand text-lg font-semibold text-white">
              {i + 1}
            </span>
            <h3 className="mt-4 text-lg font-semibold text-navy">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink/70">{step.body}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

export function Gallery({ limit = 8 }: { limit?: number }) {
  return (
    <Section>
      <SectionHead
        eyebrow="Recent work"
        title="Real jobs from Orange County homes"
        body="Photos from our own crews — carpet, rugs, upholstery, tile, and duct work."
      />
      <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
        {gallery.slice(0, limit).map((photo) => (
          <div key={photo.src} className="relative aspect-square overflow-hidden rounded-xl">
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(min-width: 768px) 22vw, 45vw"
              className="object-cover transition duration-500 hover:scale-105"
            />
          </div>
        ))}
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
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cities.map((c) => {
          const image = cityImage(service, c.city);
          return (
            <Link
              key={c.route}
              href={`${c.route}/`}
              className="group relative overflow-hidden rounded-2xl shadow-card"
            >
              <div className="relative aspect-16/9">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(min-width: 1024px) 22rem, (min-width: 640px) 45vw, 100vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <span className="absolute inset-0 bg-linear-to-t from-navy/90 via-navy/25 to-transparent" />
              </div>
              <span className="absolute bottom-0 left-0 right-0 flex items-center justify-between gap-2 p-4 text-white">
                <span className="font-semibold">{titleCase(c.city)}</span>
                <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          );
        })}
      </div>
    </Section>
  );
}
