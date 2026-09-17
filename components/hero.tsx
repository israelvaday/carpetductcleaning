import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, ShieldCheck, Star, Phone } from "lucide-react";
import { asset, type Img } from "@/lib/images";
import { site } from "@/lib/site";
import { Reveal } from "@/components/fx";

const HERO_STATS = [
  { value: site.jobs, label: "Jobs completed" },
  { value: `${site.rating}★`, label: "Google rating" },
  { value: `${new Date().getFullYear() - site.foundingYear}+`, label: "Years in OC" },
  { value: "Same-day", label: "Openings" },
] as const;

/**
 * Full-bleed dark hero with a photo background, gradient scrim, proof panel,
 * and a stat bar. Used on the homepage.
 */
export function HomeHero({ image }: { image: Img }) {
  return (
    <section className="relative overflow-hidden bg-navy text-white">
      <Image
        src={image.src}
        alt={image.alt}
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-45 saturate-[1.05]"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy/85 to-brand/30" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(20,161,154,0.20),transparent_46%)]" />

      <div className="container-page relative flex flex-col justify-end pb-10 pt-24 md:min-h-[88vh] md:pb-16 md:pt-32">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <Reveal>
            <div className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-full border border-brand-light/30 bg-brand/15 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-50">
              <MapPin className="size-3.5 shrink-0" />
              <span>{site.city} · {site.area} · Since {site.foundingYear}</span>
            </div>

            <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Carpet &amp; air duct cleaning that Orange County trusts.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
              Truck-mounted hot-water extraction and HEPA duct cleaning from IICRC-certified
              technicians — with an itemized quote before we start and same-day openings.
            </p>

            <div className="mt-8 flex w-full max-w-xl flex-col gap-3 sm:flex-row">
              <a
                href={site.phoneHref}
                className="inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-full bg-gold px-6 text-base font-bold uppercase tracking-wide text-navy shadow-glow transition hover:bg-gold-dark"
              >
                <Phone className="size-5" />
                Call {site.phone}
              </a>
              <Link
                href="/contact/"
                className="inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 text-base font-bold uppercase tracking-wide text-white backdrop-blur transition hover:border-gold/60 hover:text-gold"
              >
                Free quote
                <ArrowRight className="size-5" />
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.15} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md">
              <div className="flex items-center gap-2 text-gold">
                <ShieldCheck className="size-5 shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider">Why homeowners call us</span>
              </div>
              <ul className="mt-3 space-y-2 text-sm text-white/85">
                {["IICRC-certified, background-checked crews", "EPA Safer Choice products, kid & pet safe", "Itemized quote on-site — no bait-and-switch"].map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <Star className="mt-0.5 size-4 shrink-0 fill-gold text-gold" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-gold/40 bg-gradient-to-br from-brand to-brand-dark p-5 text-white shadow-lift">
              <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
                <Phone className="size-5 shrink-0" />
                Same-day openings
              </div>
              <p className="mt-2 text-sm font-medium leading-relaxed text-white/90">
                Call now or send photos for a fast, itemized quote anywhere in {site.area}.
              </p>
              <a href={site.phoneHref} className="mt-3 inline-flex items-center gap-2 text-sm font-extrabold underline-offset-4 hover:underline">
                {site.phone} →
              </a>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.25}>
          <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/15 bg-white/15 sm:grid-cols-4">
            {HERO_STATS.map(({ value, label }) => (
              <div key={label} className="bg-navy/80 px-4 py-4 text-center backdrop-blur-sm md:py-5">
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
