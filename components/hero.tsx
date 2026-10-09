import Image from "next/image";
import { MapPin, ShieldCheck, Star, Phone } from "lucide-react";
import { type Img } from "@/lib/images";
import { TrustBadges } from "@/components/ui";
import { QuoteButton } from "@/components/quote-button";
import { site } from "@/lib/site";
import { Reveal } from "@/components/fx";

const HERO_STATS = [
  { value: site.jobs, label: "Jobs completed" },
  { value: `${site.rating}★`, label: "Google rating" },
  { value: `${new Date().getFullYear() - site.foundingYear}+`, label: "Years in OC" },
  { value: "Same-day", label: "Openings" },
] as const;

/**
 * Full-bleed photo behind the copy. A navy wash is heavier on the left so the
 * type stays readable, and fades so the room stays visible through and beside it.
 */
export function HomeHero({ image }: { image: Img }) {
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

      <div className="container-page relative z-10 flex flex-col gap-10 py-12 lg:py-16">
        <div className="grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
          <Reveal from="left" className="text-center lg:text-left">
            <div className="mx-auto inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-full border border-brand-light/30 bg-brand/15 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-50 lg:mx-0">
              <MapPin className="size-3.5 shrink-0" />
              <span>{site.city} · {site.area} · Since {site.foundingYear}</span>
            </div>

            <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight text-white sm:text-5xl lg:mx-0">
              Carpet and air duct cleaning for Irvine and Orange County.
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg lg:mx-0">
              Truck-mounted hot-water extraction and HEPA duct cleaning from a Google Guaranteed
              crew — with an itemized quote before we start and same-day openings.
            </p>

            <div className="mx-auto mt-8 flex w-full max-w-xl flex-col gap-3 sm:flex-row lg:mx-0">
              <a
                href={site.phoneHref}
                className="inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-full bg-gold px-6 text-base font-bold uppercase tracking-wide text-navy shadow-glow transition hover:bg-gold-dark"
              >
                <Phone className="size-5" />
                Call {site.phone}
              </a>
              <QuoteButton
                dark
                label="Book"
                service=""
                className="h-14 flex-1 px-6 text-base"
              />
            </div>
            <TrustBadges className="mx-auto mt-6 justify-center lg:mx-0 lg:justify-start" />
          </Reveal>

          <Reveal from="right" delay={0.12} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-2xl border border-white/20 bg-navy/35 p-5 text-center shadow-lift backdrop-blur-md lg:text-left">
              <div className="flex items-center justify-center gap-2 text-gold lg:justify-start">
                <ShieldCheck className="size-5 shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider">Why homeowners call us</span>
              </div>
              <ul className="mx-auto mt-3 w-fit space-y-2 text-left text-sm text-white/85 lg:mx-0">
                {["Google Guaranteed, background-checked crews", "EPA Safer Choice products, kid & pet safe", "Itemized quote on-site — no bait-and-switch"].map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <Star className="mt-0.5 size-4 shrink-0 fill-gold text-gold" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-gold/40 bg-gradient-to-br from-brand to-brand-dark p-5 text-center text-white shadow-lift lg:text-left">
              <div className="flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-wider lg:justify-start">
                <Phone className="size-5 shrink-0" />
                Same-day openings
              </div>
              <p className="mt-2 text-sm font-medium leading-relaxed text-white/90">
                Call now or send photos for a fast, itemized quote anywhere in {site.area}.
              </p>
              <a href={site.phoneHref} className="mt-3 inline-flex items-center justify-center gap-2 text-sm font-extrabold underline-offset-4 hover:underline">
                {site.phone} →
              </a>
            </div>
          </Reveal>
        </div>

        <Reveal from="up" delay={0.2}>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/20 bg-white/20 sm:grid-cols-4">
            {HERO_STATS.map(({ value, label }) => (
              <div key={label} className="bg-navy/45 px-4 py-4 text-center backdrop-blur-md md:py-5">
                <p className="text-2xl font-bold text-gold md:text-3xl">{value}</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/60 md:text-[11px]">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
